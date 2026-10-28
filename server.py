import http.server
import socketserver
import os
import json

PORT = 8090
DIRECTORY = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static')

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        if self.path == '/api/health':
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            status = {
                'status': 'healthy',
                'service': 'wgp15-companion',
                'target': 'Fantech EOS Pro WGP15',
                'soc': 'ZhiXu ZXD2055',
                'firmware': 'v1.56 (20240320)'
            }
            self.wfile.write(json.dumps(status).encode('utf-8'))
            return
        
        return super().do_GET()

if __name__ == '__main__':
    # Allow address reuse
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"WGP15 Controller Companion serving at http://0.0.0.0:{PORT} from {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server...")
