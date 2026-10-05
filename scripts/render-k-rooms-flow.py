#!/usr/bin/env python3
"""Renderiza assets/anim/k-rooms-flow.html (5 s, 30 fps, 1500×1800) a MP4 y WebM + póster.

Un solo Chrome sin interfaz controlado por el protocolo de DevTools: para cada
fotograma llama a window.__render(t) y captura. Solo biblioteca estándar.
Uso: python3 scripts/render-k-rooms-flow.py   (necesita Google Chrome y ffmpeg)
"""
import base64, json, os, shutil, socket, subprocess, sys, tempfile, time, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'assets/anim/k-rooms-flow.html')
OUT = os.path.join(ROOT, 'assets/anim')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
FPS, SECONDS, PORT = 30, 5, 9333


class WS:
    """Cliente websocket mínimo (texto, sin extensiones)."""
    def __init__(self, url):
        host, path = url[5:].split('/', 1)
        h, p = host.split(':')
        self.s = socket.create_connection((h, int(p)))
        key = base64.b64encode(os.urandom(16)).decode()
        self.s.sendall((f'GET /{path} HTTP/1.1\r\nHost: {host}\r\nUpgrade: websocket\r\n'
                        f'Connection: Upgrade\r\nSec-WebSocket-Key: {key}\r\nSec-WebSocket-Version: 13\r\n\r\n').encode())
        buf = b''
        while b'\r\n\r\n' not in buf:
            buf += self.s.recv(4096)
        self.rest = buf.split(b'\r\n\r\n', 1)[1]

    def _read(self, n):
        while len(self.rest) < n:
            chunk = self.s.recv(1 << 20)
            if not chunk:
                raise EOFError
            self.rest += chunk
        d, self.rest = self.rest[:n], self.rest[n:]
        return d

    def send(self, text):
        data = text.encode()
        head = bytearray([0x81])
        n = len(data)
        if n < 126: head.append(0x80 | n)
        elif n < 65536: head += bytes([0x80 | 126]) + n.to_bytes(2, 'big')
        else: head += bytes([0x80 | 127]) + n.to_bytes(8, 'big')
        mask = os.urandom(4)
        self.s.sendall(bytes(head) + mask + bytes(b ^ mask[i % 4] for i, b in enumerate(data)))

    def recv(self):
        msg = b''
        while True:
            b0, b1 = self._read(2)
            n = b1 & 0x7f
            if n == 126: n = int.from_bytes(self._read(2), 'big')
            elif n == 127: n = int.from_bytes(self._read(8), 'big')
            msg += self._read(n)
            if b0 & 0x80:
                return msg.decode()


class CDP:
    def __init__(self, ws):
        self.ws, self.i = ws, 0

    def __call__(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({'id': self.i, 'method': method, 'params': params}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get('id') == self.i:
                if 'error' in m:
                    raise RuntimeError(m['error'])
                return m.get('result', {})


def main():
    tmp = tempfile.mkdtemp()
    chrome = subprocess.Popen([CHROME, '--headless=new', '--hide-scrollbars', f'--remote-debugging-port={PORT}',
                               f'--user-data-dir={tmp}/profile', 'about:blank'],
                              stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    try:
        for _ in range(100):
            try:
                tabs = json.load(urllib.request.urlopen(f'http://127.0.0.1:{PORT}/json'))
                page = next(t for t in tabs if t['type'] == 'page')
                break
            except Exception:
                time.sleep(.1)
        cdp = CDP(WS(page['webSocketDebuggerUrl']))
        cdp('Emulation.setDeviceMetricsOverride', width=750, height=900, deviceScaleFactor=2, mobile=False)
        cdp('Page.enable')
        cdp('Page.navigate', url='file://' + SRC + '?t=0')
        for _ in range(100):
            r = cdp('Runtime.evaluate', expression="document.readyState==='complete'&&document.fonts.status==='loaded'&&!!window.__render", returnByValue=True)
            if r['result'].get('value'):
                break
            time.sleep(.1)
        frames = os.path.join(tmp, 'f')
        os.mkdir(frames)
        total = FPS * SECONDS
        for n in range(total):
            cdp('Runtime.evaluate', expression=f'__render({n / FPS})')
            png = cdp('Page.captureScreenshot', format='png')['data']
            with open(os.path.join(frames, f'{n:03d}.png'), 'wb') as f:
                f.write(base64.b64decode(png))
            print(f'\rfotograma {n + 1}/{total}', end='', flush=True)
        print()
    finally:
        chrome.terminate()
    seq = os.path.join(frames, '%03d.png')
    ff = ['ffmpeg', '-y', '-loglevel', 'error', '-framerate', str(FPS), '-i', seq]
    subprocess.run(ff + ['-c:v', 'libx264', '-crf', '14', '-preset', 'slow', '-pix_fmt', 'yuv420p',
                         '-movflags', '+faststart', os.path.join(OUT, 'k-rooms-flow.mp4')], check=True)
    subprocess.run(ff + ['-c:v', 'libvpx-vp9', '-crf', '24', '-b:v', '0', '-row-mt', '1', '-pix_fmt', 'yuv420p',
                         os.path.join(OUT, 'k-rooms-flow.webm')], check=True)
    # póster: el estado final (asignada, ya sin el dedo), en JPG para la carga inicial
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', os.path.join(frames, '126.png'), '-q:v', '3',
                    os.path.join(OUT, 'k-rooms-flow-poster.jpg')], check=True)
    shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main())
