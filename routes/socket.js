var app = require('express')
var shortid = require('shortid')
var router = app.Router()
var fs = require("fs")

module.exports = function (io) {
  var welcomeMessage = 'Pad created! Share the URL with a friend to edit text in real-time.'
  var pages = new Map() // Stores Pad data

  try {
    var content = fs.readFileSync('data/data1.txt')
    pages.set('default', content.toString())
  } catch (err) {
    try {
      fs.mkdirSync("data")
    } catch (err) {}
    fs.writeFileSync("data/data1.txt", "")
    pages.set('default', "")
  }

  // Handle WebSocket connections
  io.on('connection', function (socket) {
    console.log('A user connected')

    // Handle sync request
    socket.on('sync', function (data) {
      if (pages.has(data.path)) {
        // Page exists, notify with pad data
        notify(socket, pages.get(data.path), data.path)
        console.log('Paste accessed: ' + data.path)
      } else {
        // Page doesn't exist, notify with new pad
        notify(socket, '', data.path)
        console.log('Created paste: ' + data.path)
      }

      // Remove junk objects from Map, save space
      clearUpMemory()
    })

    // Handle incoming data from user
    socket.on('data', function (data) {
      // Update pad data in memory
      pages.set(data.path, data.text)
      var curr = pages.get(data.path)

      // Write to local data
      fs.writeFile('data/data1.txt', curr, function (err) {
        if (err) {
          return console.error(err)
        }
      })

      // backup datas in reverse order
      function backup_reverse(level) {
        var current_file_name = "data/data" + level + ".txt"
        var last_file_name = "data/data" + (level - 1) + ".txt"
        fs.readFile(last_file_name, function (err, content) {
          if (err) {
            // console.error("文件：" + last_file_name + "还没有呢")
            // console.error(err)
            backup_reverse(level - 1)
          } else {
            fs.writeFile(current_file_name, content.toString(), function (err) {
              if (err) {
                console.error(err)
              } else {
                if (level - 1 > 1) {
                  backup_reverse(level - 1)
                }
              }
            })
          }
        })
      }
      backup_reverse(200)

      // Notify everyone of update
      notifyAll(socket, curr, data.path)
    })
  })

  // Send update to client
  function notify(socket, c, p) {
    socket.emit('notify', {
      content: c,
      path: p
    })
  }

  // Send update to all clients
  function notifyAll(socket, c, p) {
    socket.broadcast.emit('notify', {
      content: c,
      path: p
    })
  }

  // Clean up memory if Map gets too full
  function clearUpMemory() {
    for (var [key, value] of pages) {
      if (value == '') {
        pages.delete(key)
      }
    }
  }

  /* GET pad by unique id */
  router.get('/:id', function (req, res, next) {
    res.render('pad', {
      title: 'Pad',
      temp: welcomeMessage
    })
  })

  /* Handle POST, redirect to GET pad by unique id */
  router.post('/:id', function (req, res, next) {
    res.render('pad', {
      title: 'Pad',
      temp: welcomeMessage
    })
  })

  /* Handle index requests for /Pad */
  router.get('/', function (req, res, next) {
    var sid = shortid.generate()
    res.render('index', {
      title: 'Welcome to Pad',
      buttonLbl: 'Get started',
      id: sid
    })
  })

  return router
}