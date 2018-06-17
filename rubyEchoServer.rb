#echos back whatever get request you send it
DEFAULT_PORT=2345
require 'socket'
server = TCPServer.new('localhost', DEFAULT_PORT)
puts "Server running on http://localhost:#{DEFAULT_PORT}/"
while session = server.accept
  request = session.gets
  puts request

  response ='hello There'
  session.print "HTTP/1.1 200\r\n" # 1
  session.print "Content-Type: text/html\r\n" # 2
  session.print "\r\n" # 3
  session.print response #4

  session.close
end
