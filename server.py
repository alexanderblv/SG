#!/usr/bin/env python3
"""
Simple HTTP server for testing Seismic Game locally
Run with: python server.py
"""
import http.server
import socketserver
import os
import sys
from pathlib import Path

PORT = 3000

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=os.getcwd(), **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

def main():
    # Check if we're in the right directory
    if not Path('index.html').exists():
        print("❌ index.html not found in current directory!")
        print("Please run this script from the SGnew directory")
        sys.exit(1)
    
    handler = CustomHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print(f"🚀 Seismic Game server starting on port {PORT}")
        print(f"📱 Open your browser and go to: http://localhost:{PORT}")
        print(f"🛑 Press Ctrl+C to stop the server")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped by user")
            httpd.shutdown()

if __name__ == "__main__":
    main() 