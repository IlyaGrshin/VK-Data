const crypto = require('crypto')
const url = require('url')
const http = require('http')

const HOST = 'url'
const APP_ID = 'id'
const SCOPE = 'offline,friends,groups,video'
const REDIRECT_URI = HOST + '/callback'

const port = process.env.PORT || 8000
const hostname = 'localhost';
const readMap = new Map
const writeMap = new Map

http.createServer((req, res) => {
  const parsedURL = url.parse(req.url, true)

  if (req.method === 'GET' && parsedURL.pathname === '/keys') {
    crypto.randomBytes(64, (err, buf) => {
      if (err) throw err

      const read_key = buf.slice(0, buf.length >> 1).toString('base64')
      const write_key = buf.slice(buf.length >> 1).toString('base64')
      const obj = { read_key, write_key, data: null }
      readMap.set(read_key, obj)
      writeMap.set(write_key, obj)

      setTimeout(() => {
        readMap.delete(read_key)
        writeMap.delete(write_key)
      }, 5 * 60 * 1000)

      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      })
      res.end(JSON.stringify({ read_key, write_key }))
    })
    return
  }

  if (req.method === 'GET' && parsedURL.pathname === '/start') {
    const query = parsedURL.query || {}
    const write_key = query.write_key

    if (write_key) {
      res.writeHead(302, {
        'Location': 'https://oauth.vk.com/authorize' +
          '?client_id=' + encodeURIComponent(APP_ID) +
          '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
          '&display=page' +
          '&scope=' + encodeURIComponent(SCOPE) +
          '&response_type=token' +
          '&state=' + encodeURIComponent(write_key) +
          '&revoke=1'
      })
      res.end()
      return
    }
  }

  if (req.method === 'GET' && parsedURL.pathname === '/callback') {
    res.writeHead(200, {
      'Content-Type': 'text/html',
    })
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
      <script>
        var parts = location.hash.slice(1).split('&')
        var query = {}
        parts.forEach(function(part) {
          var index = part.indexOf('=')
          query[decodeURIComponent(part.slice(0, index))] = decodeURIComponent(part.slice(index + 1))
        })
        fetch('/token?write_key=' + encodeURIComponent(query.state), {
          method: 'POST',
          body: JSON.stringify(query),
        }).then(function() {
          console.log('Work')
        })
      </script>
      <style>
        body {
          font-family: -apple-system, system-ui, Roboto, sans-serif;
          padding: 20px;
          margin: 0;
        }
      </style>
      </head>
      <body>
        Close the tab and go to use VK Data at Figma.
      </body>
      </html>
    `)
    return
  }

  if (req.method === 'POST' && parsedURL.pathname === '/token') {
    const query = parsedURL.query || {}
    const write_key = query.write_key
    const obj = writeMap.get(write_key)

    if (write_key && obj) {
      let data = ''
      req.on('data', chunk => data += chunk.toString())
      req.on('end', () => {
        obj.data = data
        writeMap.delete(write_key)

        res.writeHead(200)
        res.end('Success')
      })
      return
    }
  }

  if (req.method === 'GET' && parsedURL.pathname === '/finish') {
    const query = parsedURL.query || {}
    const read_key = query.read_key
    const obj = readMap.get(read_key)

    if (read_key && obj) {
      if (obj.data !== null) {
        readMap.delete(read_key)
      }

      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      })
      res.end(obj.data)
      return
    }
  }

  res.writeHead(404)
  res.end('Not Found')
}).listen(port, hostname)

console.log(`Server running at http://${hostname}:${port}/`);
