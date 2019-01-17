
hello()

// importo i moduli locali
var auth = require('./auth.js')
//var queue = require('./queues.js')
var post = require('./upload_post.js')
var globals = require('./globals.js')
var req_list = globals.req_list
var log = globals.log


// load and configuring libraries
// bodyParser mi serve per parsare la POST
var bodyParser = require('body-parser')
var c00kies = require('cookie-parser')
var express = require('express')
var multer  = require('multer')
var upload = multer({ dest: 'MainServer/res/uploads/' })
//var fs = require('fs')
var app = express()
var server = null
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))
app.use(c00kies())

// Required for some browsers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});



// pages for debugging
app.get('/debug/cookies', function(req, res) {
  res.send(req.cookies)
})

app.get('/debug/req_list', function(req, res) {
  res.send(req_list)
})




// Home page
app.get('/', function(req, res) {
  res.redirect('/home')
})

app.get('/home', function(req, res) {
  res.sendFile(__dirname + '/res/route66_website.html')
})


// Resources
app.get('/res/:resource', function(req, res) {
  res.sendFile(__dirname + '/res/'+req.params.resource)
})



/* User POSTs when he wants to upload a post
 *
 * The body of the POST made by the user it's multipart/form-data encoded
 * 
 *   'data' = text of the post 
 *   'twt'  = 'on' if selected
 *   'tmb'  = 'on' if selected
 *   'fkr'  = 'on' if selected
 *   'image' = image path
 *
 * 
 * where twt is 'on' if the user wants to post to twitter, tmb if he wants
 * to post to tumbrl and flk for flickr
 * 
 * 'image' is optional, is the path of the image. If there's no image then
  * it's an empty string ""
 */
app.post('/home', upload.single('image'), function (req, res) {  
  post.upload_post(req, res)
})




/* tokens that will be used to verify pin are saved in req_list. token1 and token2 are URLencoded
 */
app.get('/auth/start/twitter', function(req, res) {
  auth.start('twt', req, res)
})

app.get('/auth/start/tumblr', function(req, res)  {
  auth.start('tmb', req, res)
})

app.get('/auth/start/flickr', function(req, res)  {
  auth.start('fkr', req, res)
})




/* OAuth redirect page
 */
app.get('/auth/landing/twitter', function(req, res) {
  auth.oauth_landing('twt', 'twitter', req, res)
})

app.get('/auth/landing/tumblr', function(req, res)  {
  auth.oauth_landing('tmb', 'tumblr', req, res)
})

app.get('/auth/landing/flickr', function(req, res)  {
  auth.oauth_landing('fkr', 'flickr', req, res)
})
 
 
 
 
/* After a successful auth the server register access tokens in cookies. 
 *   request body (JSON):
 *   {
 *      token1: 'token1',
 *      token2: 'token2'
 *   }
*/
app.post('/auth/access/twitter', function(req, res) {
  auth.register_access('twt', req, res)
})

app.post('/auth/access/tumblr', function(req, res)  {
  auth.register_access('tmb', req, res)
})

app.post('/auth/access/flickr', function(req, res)  {
  auth.register_access('fkr', req, res)
})



/* Clears cookie and logs out from all socials
 */
app.delete('/auth/access', function(req, res) {
  res.clearCookie('porkett')
  res.send({result:'yes', msg:'Logged out'})
  log("Cleared cookie")
})


// register CTRL+C
/*process.on('SIGINT', function() {
  log('Received stop signal, halting')
  server.close()
  setTimeout(function() {process.exit()}, 500)  // give time to flush streams
})*/

// listen on port
server = app.listen(globals.port, function () {
  log('Started listening on port '+globals.port)
})


function hello() {
  var sleep = require('sleep').sleep
  var mstring = require('mstring')
  sleep(5)

  console.log(mstring(function() {
  /***


   ROUTE 66
   
  ***/
  }))
}

