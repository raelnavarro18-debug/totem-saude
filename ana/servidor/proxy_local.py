"""
proxy_local.py — Versão "de casa" do servidor intermediário.
Faz a mesma coisa que o worker.js, mas roda no seu PC.

Uso (PowerShell):
    $env:ZAI_KEY = "cole-a-chave-aqui"
    python servidor/proxy_local.py

Depois, no painel secreto do totem, coloque como "Endereço da API":
    http://localhost:8787          (testando no próprio PC)
    http://IP-DO-PC:8787           (tablet na mesma rede Wi-Fi)
Só usa bibliotecas que já vêm com o Python.
"""
import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ZAI_URL = "https://api.z.ai/api/paas/v4/chat/completions"
MODELOS_PERMITIDOS = ["glm-4.5-flash"]
PORTA = 8787
CHAVE = os.environ.get("ZAI_KEY", "").strip()


class Proxy(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin") or "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.send_header("Vary", "Origin")

    def _responder(self, status, dados: bytes):
        self.send_response(status)
        self._cors()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(dados)))
        self.end_headers()
        self.wfile.write(dados)

    def do_OPTIONS(self):
        self.send_response(204)
        self._cors()
        self.end_headers()

    def do_POST(self):
        try:
            tamanho = int(self.headers.get("Content-Length", 0))
            corpo = json.loads(self.rfile.read(min(tamanho, 20000)) or b"{}")
        except Exception:
            return self._responder(400, b'{"erro":"JSON invalido"}')

        mensagens = (corpo.get("messages") or [])[-12:]
        if not mensagens:
            return self._responder(400, b'{"erro":"sem mensagens"}')
        modelo = corpo.get("model") if corpo.get("model") in MODELOS_PERMITIDOS else MODELOS_PERMITIDOS[0]

        envio = json.dumps({
            "model": modelo,
            "messages": mensagens,
            "temperature": corpo.get("temperature", 0.4),
            "max_tokens": min(int(corpo.get("max_tokens") or 600), 800),
            "thinking": {"type": "disabled"},
        }).encode("utf-8")
        req = urllib.request.Request(ZAI_URL, data=envio, method="POST", headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {CHAVE}",
        })
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                self._responder(r.status, r.read())
        except urllib.error.HTTPError as e:
            self._responder(e.code, e.read())
        except Exception as e:
            self._responder(502, json.dumps({"erro": str(e)}).encode("utf-8"))

    def log_message(self, fmt, *args):
        print("[proxy]", fmt % args)


if __name__ == "__main__":
    if not CHAVE:
        raise SystemExit("Defina a chave antes: $env:ZAI_KEY = \"sua-chave\"")
    print(f"Proxy da IA rodando em http://localhost:{PORTA}  (Ctrl+C para parar)")
    ThreadingHTTPServer(("0.0.0.0", PORTA), Proxy).serve_forever()
