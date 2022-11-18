var express = require('express')
var shortid = require('shortid')
var router = express.Router()

/* GET home page. */
// router.get('/', function (req, res, next) {
//   var sid = 'default'
//   res.render('index', { title: 'Welcome to Pad', buttonLbl: 'Get started', id: sid })
// })

router.get('/', function (req, res, next) {
  res.render('pad', {
    title: 'Pad',
    temp: '这是palceholder...开始写吧~'
  })
})

module.exports = router