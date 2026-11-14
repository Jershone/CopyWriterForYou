#!/usr/bin/env python3
"""
Copywriter For You — lightweight web server + booking-request API.
Standard library only. Run:  python3 server.py   (http://127.0.0.1:8000)

Endpoints:
  POST /api/booking-request  -> stores a booking REQUEST (never a confirmation)
  POST /api/contact          -> stores a contact message
Requests are appended to data/requests.jsonl (one JSON object per line).

Env vars: PORT (default 8000), HOST (default 127.0.0.1).
For production put this behind a reverse proxy with HTTPS (see README).
"""
import base64, hmac, json, os, re, uuid, threading, time, collections, datetime, pathlib
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer

ROOT = pathlib.Path(__file__).resolve().parent
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)
STORE = DATA / "requests.jsonl"
LOCK = threading.Lock()
HITS = collections.defaultdict(collections.deque)   # in-memory rate limiting

MAX_BODY = 32 * 1024          # 32 KB
RATE_LIMIT = 6                # submissions ...
RATE_WINDOW = 60              # ... per minute per IP
EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]{2,}$")
PHONE_RE = re.compile(r"^\+?[0-9 ()\-\.]{6,24}$")
DATE_RE = re.compile(r"^\d{4}-\d{2}-\d{2}$")

def clean(v, limit):
    return str(v).strip()[:limit] if isinstance(v, (str, int, float)) else ""

def validate(payload, kind):
    """Return (errors, record). Never trust the client."""
    e = {}
    r = {k: clean(payload.get(k), lim) for k, lim in {
        "name": 120, "company": 160, "email": 160, "phone": 24, "message": 4000
    }.items()}
    if len(r["name"]) < 2: e["name"] = "Vul je naam in."
    if not EMAIL_RE.match(r["email"]): e["email"] = "Vul een geldig e-mailadres in."
    if len(r["message"]) < 10: e["message"] = "Vertel iets meer over je vraag (min. 10 tekens)."
    if payload.get("privacy") is not True: e["privacy"] = "Akkoord met het privacybeleid is vereist."
    if kind == "booking":
        r["service"] = clean(payload.get("service"), 120)
        r["time"] = clean(payload.get("time"), 60)
        r["date"] = clean(payload.get("date"), 10)
        if not r["service"]: e["service"] = "Kies een dienst."
        if not r["time"]: e["time"] = "Kies een dagdeel."
        if not PHONE_RE.match(r["phone"]): e["phone"] = "Vul een geldig telefoonnummer in."
        if not DATE_RE.match(r["date"]):
            e["date"] = "Kies een geldige datum."
        else:
            try:
                d = datetime.date.fromisoformat(r["date"])
                today = datetime.date.today()
                if d < today or d > today + datetime.timedelta(days=180):
                    e["date"] = "Datum moet tussen vandaag en 180 dagen vooruit liggen."
            except ValueError:
                e["date"] = "Kies een geldige datum."
    return e, r

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *a, **kw):
        super().__init__(*a, directory=str(ROOT), **kw)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        self.send_header("Referrer-Policy", "strict-origin-when-cross-origin")
        self.send_header("X-Frame-Options", "SAMEORIGIN")
        if self.path.startswith("/api/"):
            self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def _json(self, code, obj):
        body = json.dumps(obj, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def _blocked(self):
        p = self.path.split("?")[0]
        return p.startswith("/data") or p.endswith((".py", ".md")) or "/." in p

    def _admin_credentials_valid(self):
        configured_user = os.environ.get("ADMIN_USER", "")
        configured_password = os.environ.get("ADMIN_PASSWORD", "")
        if not configured_user or not configured_password:
            return False
        header = self.headers.get("Authorization", "")
        if not header.startswith("Basic "):
            return False
        try:
            decoded = base64.b64decode(header[6:], validate=True).decode("utf-8")
            user, separator, password = decoded.partition(":")
        except (ValueError, UnicodeDecodeError):
            return False
        return (
            separator
            and hmac.compare_digest(user, configured_user)
            and hmac.compare_digest(password, configured_password)
        )

    def _admin_required(self):
        if self._admin_credentials_valid():
            return True
        self.send_response(401)
        self.send_header("WWW-Authenticate", 'Basic realm="Copywriter For You orders"')
        self.send_header("Content-Length", "0")
        self.end_headers()
        return False

    def do_GET(self):
        path = self.path.split("?")[0]
        if path == "/admin" or path == "/admin.html":
            if not self._admin_required():
                return
            self.path = "/admin.html"
        elif path == "/api/admin/requests":
            if not self._admin_required():
                return
            try:
                with LOCK:
                    entries = [
                        json.loads(line)
                        for line in STORE.read_text(encoding="utf-8").splitlines()
                        if line.strip()
                    ]
            except FileNotFoundError:
                entries = []
            except (OSError, json.JSONDecodeError):
                return self._json(500, {"ok": False, "error": "Aanvragen lezen mislukt."})
            return self._json(200, {"ok": True, "requests": list(reversed(entries))})
        if self._blocked():
            return self._json(404, {"ok": False, "error": "Niet gevonden."})
        return super().do_GET()

    def do_HEAD(self):
        if self._blocked():
            return self._json(404, {"ok": False, "error": "Niet gevonden."})
        return super().do_HEAD()

    def do_POST(self):
        kind = {"/api/booking-request": "booking", "/api/contact": "contact"}.get(self.path)
        if not kind:
            return self._json(404, {"ok": False, "error": "Onbekend endpoint."})
        try:
            length = int(self.headers.get("Content-Length", 0))
        except ValueError:
            return self._json(400, {"ok": False, "error": "Ongeldig verzoek."})
        if length <= 0 or length > MAX_BODY:
            return self._json(413, {"ok": False, "error": "Verzoek te groot of leeg."})
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            if not isinstance(payload, dict): raise ValueError
        except (ValueError, UnicodeDecodeError):
            return self._json(400, {"ok": False, "error": "Ongeldige JSON."})

        # Honeypot: bots fill the hidden field. Accept silently, store nothing.
        if clean(payload.get("website"), 200):
            return self._json(200, {"ok": True, "id": "CFY-000000"})

        ip = self.client_address[0]
        now = time.monotonic()
        with LOCK:
            q = HITS[ip]
            while q and now - q[0] > RATE_WINDOW: q.popleft()
            if len(q) >= RATE_LIMIT:
                return self._json(429, {"ok": False, "error": "Te veel aanvragen. Probeer het over een minuut opnieuw of bel +31 6 14645205."})
            q.append(now)

        errors, record = validate(payload, kind)
        if errors:
            return self._json(400, {"ok": False, "error": "Controleer de gemarkeerde velden.", "fields": errors})

        ref = "CFY-" + uuid.uuid4().hex[:6].upper()
        entry = {"id": ref, "type": kind, "status": "aangevraagd",
                 "receivedAt": datetime.datetime.now(datetime.timezone.utc).isoformat(), **record}
        try:
            with LOCK, STORE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        except OSError:
            return self._json(500, {"ok": False, "error": "Opslaan mislukt. Bel +31 6 14645205."})
        return self._json(200, {"ok": True, "id": ref})

    def log_message(self, fmt, *args):
        if self.path.startswith("/api/"):
            super().log_message(fmt, *args)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    host = os.environ.get("HOST", "127.0.0.1")
    print(f"Copywriter For You draait op http://{host}:{port}  (aanvragen: {STORE})")
    ThreadingHTTPServer((host, port), Handler).serve_forever()