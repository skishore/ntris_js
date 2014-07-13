#!/usr/bin/python
import SocketServer
import SimpleHTTPServer
import sys
import uuid


class SavePostsHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
  def do_GET(self):
    SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

  def do_POST(self):
    length = int(self.headers.getheader('content-length'))
    data = self.rfile.read(length)
    filename = str(uuid.uuid4())
    with open('difficulty_curves/%s' % (filename,), 'wb') as f:
      f.write(data)
    self.send_response(200, "OK")


if __name__ == '__main__':
  port = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
  SocketServer.TCPServer.allow_reuse_address = True
  server = SocketServer.TCPServer(('', port), SavePostsHandler)
  server.serve_forever()
