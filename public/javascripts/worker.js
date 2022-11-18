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
socket.emit('sync', { path: pathname })

// Set TextArea as server response
socket.on('notify', function (data) {
  if (data.path == pathname) {
    document.getElementById('text').value = data.content
  } else {
    console.log('Recieved: ' + data.path + ' Have: ' + pathname)
  }
})

// Send latest data to server
function processText(e) {
  var x = e.target.value
  updateScreen(x);

  if (cache != x) {
    socket.emit('data', {
      text: x,
      path: pathname
    })
    cache = x
  }
}

// dynamic styling

var out = null
var need_transparent = true

function updateScreen(text) {
  if (out == null) {
    out = document.getElementById("out")
    text_in = document.getElementById("text")
  } else {
    out.innerHTML = colorize(text)
    if (need_transparent){
      document.getElementById('text').style.color = "transparent"
      need_transparent = false
    }
  }
}

function scrollfun(e) {
  var elem = e.target
  if (out == null) {
    out = document.getElementById("out")
    text_in = document.getElementById("text")
    document.getElementById('text').style.color = "transparent"
  } else {
    // set out to be the same as in
    out.style.top = `-${elem.scrollTop}px`
    if (need_transparent){
      document.getElementById('text').style.color = "transparent"
      need_transparent = false
    }
  }
}


function colorize(text) {

  function process(keywords, color) {
    for (let keyword of keywords) {
      text = text.replaceAll(keyword, `<span style="color:${color}">${keyword}</span>`)
    }
  }

  process(["[ ]"], "red")
  process(["[x]"], "green")

  return text
}