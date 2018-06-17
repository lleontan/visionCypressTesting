#this file is terrible.
#use webBrickServer.rb instead.
#if you're going to keep working on this server double check the paths.


#Hosts a webpage that indentifies details about submitted images.
#Hosts a POST server that takes images and returns details about them from google images.
#html server runs on http://localhost:4534/
#POST server runs on http://localhost:4535/
DEFAULT_PORT=4534
DEFAULT_POST_PORT=4535
DEFAULT_HTML_PATH="scripts/index.html"
DEFAULT_JS_PATH="scripts/googleVisionTest.js"

#require 'webrick'
require 'socket'
require 'net/http'
require 'uri'
require 'json'
require 'launchy'

#Takes a base64String of a image and returns details from google vision.
#{string} image_string: image encoded as a base64 String.
#{Hash} call_features: type of action to preform. See
#https://cloud.google.com/vision/docs/request for details.
#returns {json string}:See https://cloud.google.com/vision/docs/request for details
def apiRequest(image_string,call_features)
  uri = URI.parse("https://vision.googleapis.com/v1/images:annotate
    ?key=AIzaSyCut3bWAFz-MasgqQgmEEl8_mYq_tmOGIs")
  post_body={
    requests:[
      {
        image:{
          content:image_string
        },
        features:call_features
      }
    ]
  }
  header = {'Content-Type': 'text/json',
      'Access-Control-Allow-Origin': "*",
      'Access-Control-Allow-Headers': "*"
    }
  http = Net::HTTP.new(uri.host, uri.port)
  http.use_ssl = true
  request = Net::HTTP::Post.new(uri.request_uri, header)
  request.body = post_body.to_json
  response = http.request(request)
  response
end

#Gets the mode from the data and calls the API. Returns the response from the API.
def checkModes(data)
  mode = data['mode']
  call_features=Array.new(1) { Hash.new }
  if mode=="labels"
    call_features<<{
        type:"LABEL_DETECTION",
        maxResults:1
      }
  end
  return apiRequest(data['image'],call_features)
end
#Starts the webserver that takes images and sends them to the API.
#html server runs on http://localhost:4534/
def start_webserver()
  server = TCPServer.new('localhost', DEFAULT_PORT)
  puts "Vision server running on http://localhost:#{DEFAULT_PORT}/"
  while session = server.accept
    time = Time.new
    puts "New connection #{time.inspect}"
    if File.exist?(DEFAULT_HTML_PATH) && !File.directory?(DEFAULT_HTML_PATH)
      File.open(DEFAULT_HTML_PATH, "rb") do |file|
          session.print "HTTP/1.1 200 OK\r\n" +
                       "Content-Type: text/html\r\n" +
                       "Content-Length: #{file.size}\r\n" +
                       "Connection: close\r\n"

          session.print "\r\n"

          # write the contents of the file to the session
          IO.copy_stream(file, session)
        end
      else
        message = "HTML File not found\n"
        # respond with a 404 error code to indicate the file does not exist
        session.print "HTTP/1.1 404 Not Found\r\n" +
                     "Content-Type: text/plain\r\n" +
                     "Content-Length: #{message.size}\r\n" +
                     "Connection: close\r\n"

        session.print "\r\n"
        session.print message
    end
  end
end

#Starts server for the API.
#POST server runs on http://localhost:4535/
#takes the packageBody as a jsonString
def start_post_server()
  server = TCPServer.new('localhost', DEFAULT_POST_PORT)
  puts "POST Server running on http://localhost:#{DEFAULT_POST_PORT}/"
  while session = server.accept
    method, path = session.gets.split                    # In this case, method = "POST" and path = "/"
    headers = {}
    while line = session.gets.split(' ', 2)              # Collect HTTP headers
      puts line
      break if line[0] == ""                            # Blank line means no more headers
        headers[line[0].chop] = line[1].strip             # Hash headers by type
    end
    puts headers["Content-Length"].to_i
    data = JSON.parse(session.read(headers["Content-Length"].to_i))  # Read the POST data as specified in the header
    response = checkModes(data)           # Do what you want with the POST data

    session.print "HTTP/1.1 200\r\n" # 1
    session.print "Content-type:application/json\r\n" # 2
    session.print "\r\n" # 3
    session.print response #4
    session.close
  end
end
Launchy.open("http://localhost:#{DEFAULT_PORT}/")

http_process = Process.fork do
  start_webserver()
end
start_post_server()
