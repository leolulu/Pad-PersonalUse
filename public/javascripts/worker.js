var socket = io()
var cache = ''
var firstLoad = true

var f = window.location.pathname
var temp = f.split('/')
var pathname

if (f.substr(f.length - 1) == '/') {
  pathname = temp[temp.length - 2]
} else {
  pathname = temp[temp.length - 1]
}

// Ask server latest data
socket.emit('sync', {
  path: pathname
})

// Set TextArea as server response
socket.on('notify', function (data) {
  if (data.path == pathname) {
    document.getElementById('text').value = data.content
    updateScreen(data.content)
  } else {
    console.log('Recieved: ' + data.path + ' Have: ' + pathname)
  }
})

// Send latest data to server
function processText() {
  var x = document.getElementById('text').value
  updateScreen(x)

  if (cache != x) {
    socket.emit('data', {
      text: x,
      path: pathname
    })
    cache = x
  }
}

// dynamic styling

function keydownfun(e) {
  updateScreen(e.target.value)
}


function updateScreen(text) {
  document.getElementById("out").innerHTML = colorize(text)
}

function scrollfun(e) {
  var elem = e.target
  // set out to be the same as in
  document.getElementById("out").style.top = `-${elem.scrollTop}px`
}


function colorize(text) {

  function process(keywords, color) {
    for (let keyword of keywords) {
      text = text.replaceAll(keyword, `<span style="color:${color}">${keyword}</span>`)
    }
  }

  process(["[x]"], "green")
  process(["[ ]", "[]"], "red")
  process(["adj.", "n.", "v.", "adv."], "#7DB9DE")
  process(["* ", "- "], "#F7D94C")

  return text
}