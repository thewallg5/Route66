// CHIAMATO DAL MAINSERVER

// si occupa di caricare il post facendo i controlli necessari e inoltrando alle code

var queue = require('./queues.js')
var globals = require('./globals.js')
var log = globals.log




/* User POSTs when he wants to upload a post
 *
 * The body of the POST made by the user it's multipart/form-data encoded
 * 
 *   'data' = text of the post 
 *   'twt'  = 'on' if selected
 *   'tmb'  = 'on' if selected
 *   'fkr'  = 'on' if selected
 *   'image' = path
 *
 * 
 * where twt is 'on' if the user wants to post to twitter, tmb if he wants
 * to post to tumbrl and flk for flickr
 * 
 * 'image' is optional, is the path of the image. If there's no image then
 * it's an empty string ""
 */
function upload_post(req, res) {
  var text = req.body.text
 
  // Build list from single fields
  var list = []
  if (req.body.twt == 'on') list.push('twt')
  if (req.body.tmb == 'on') list.push('tmb')
  if (req.body.fkr == 'on') list.push('fkr')
  
  var image = req.file
  if (typeof(image)=='undefined')
    image = ""
  
  log('Received text:'+text+' list:'+list+' image:'+(image.length>0).toString())

  // sanity check, list and text can't be undefined
  if (typeof(text) == 'undefined' || typeof(list) == 'undefined') {
    res.status(400)   //bad request
    res.send({result:'no', msg:"The received POST didn't have correct parameters in the body"})
    return
  }

  text = text.trim()   //removing leading and trailing spaces
  
  // sanity check, filter all social not listed in RPC_FORMAT.md
  //list = list.filter(function(e){ return !e in ['fb','twt','g+','tmb'] })

  // sanity check, if list is empty i don't publish on any social network
  if (list.length == 0) {
    res.send({result:'no', msg:'no social selected'})
    return
  }
  
  // sanity check, text must be non-empty
  if (text.length == 0) {
    res.send({result:'no', msg:'text can\'t be empty'})
    return
  }

  // sanity check, if user post contains utf char '\xFF' 'ÿ', substitute the 'ÿ' with a 'y'
  text = text.replace(new RegExp('\xFF', 'g'), 'y')
 
  
  // C00kies sanity checks
  cookie = req.cookies.route
  var need_auth = []
  list.forEach( function(network) {
    if (typeof(cookie)=='undefined' || typeof(cookie.logged)=='undefined' ||
            !cookie.logged.includes(network))
      need_auth.push(network)
  })
  
  // If cookie fails sanity check
  if (need_auth.length > 0) {
    res.send({result:"no", msg:"Need auth to "+need_auth, auth:need_auth})
    return
  }


  var token1 = []
  var token2 = []
  var exception = false
  list.forEach( function(network) {
    try {
      token1.push(cookie[network].token1)
      token2.push(cookie[network].token2)
    } catch (ex) {
      exception = true
      res.send({result:"no", msg:"Need auth", auth:[network]})
      return
    }
  })
  
  if (exception)
    return

  // if the program is here we have a token, proceed to upload post
  // (Following RPC syntax in RPC_FORMAT.md)
  for (var i=0; i<list.length; i++) {
    var msg = ['upload_post', token1[i], token2[i], text, image.path].join('\xFF')
    if (list[i]=='fkr' && image=='')
      log('Trying to send to flickr only text, skipping')
    else
	  queue.send(msg, list[i])
  }

  res.send({result:"yes", msg:"forwarded to "+list})
}

module.exports = {
  upload_post
}