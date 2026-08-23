#!/usr/bin/env python3
"""
serve.py — helyi teszteléshez.

Automatikusan talál egy SZABAD portot (nem ütközik más futó projekttel),
elindít egy statikus HTTP szervert ebben a mappában, és megnyitja a
böngészőt. A Service Worker és az IndexedDB miatt szükséges HTTP(S)
kontextus — a file:// megnyitás NEM lenne elég.

Használat:
    python3 serve.py
    (vagy: python3 serve.py 8080   -> ha ezt a portot preferálod, de ha
     foglalt, akkor is automatikusan másikat keres)
"""
import http.server
import socket
import sys
import webbrowser
import functools
import os

PREFERRED_PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
HOST = "127.0.0.1"


def find_free_port(preferred: int) -> int:
    """Megpróbálja a preferált portot, ha foglalt, sorban a következőket,
    végül ha semmi sem jó, az OS-re bízza egy teljesen szabad port kiválasztását."""
    candidates = list(range(preferred, preferred + 50))
    for port in candidates:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            try:
                s.bind((HOST, port))
                return port
            except OSError:
                continue  # foglalt, jöhet a következő

    # Ha az összes candidate foglalt volt, kérjünk egy teljesen tetszőleges,
    # az OS által garantáltan szabad portot.
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind((HOST, 0))
        return s.getsockname()[1]


def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)

    port = find_free_port(PREFERRED_PORT)
    if port != PREFERRED_PORT:
        print(f"⚠️  A(z) {PREFERRED_PORT}-as port foglalt (valószínűleg egy másik "
              f"projekted fut rajta) — helyette a(z) {port}-as szabad portot használom.")

    handler = functools.partial(
        http.server.SimpleHTTPRequestHandler,
        directory=script_dir,
    )

    url = f"http://{HOST}:{port}/"
    with http.server.ThreadingHTTPServer((HOST, port), handler) as httpd:
        print(f"\n🍕  PizzaTárcsa fut itt: {url}")
        print("   Kilépés: Ctrl+C\n")
        print("   Megjegyzés: ha a Service Worker miatt a böngésző régi verziót "
              "mutatna kódmódosítás után, nyisd meg DevTools → Application → "
              "Service Workers, és kattints az „Unregister” / „Update on reload” opcióra.\n")
        try:
            webbrowser.open(url)
        except Exception:
            pass
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nLeállítva.")


if __name__ == "__main__":
    main()