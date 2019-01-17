
// FUNZIONI AUTH,CHIAMATE DAL MAINSERVER


// in the parameters, social_id means 'twt', 'tmb', 'fkr' ecc.., while social_name is the
// regular name, like 'twitter', 'tumblr'. It's useful when redirecing to main server,
// e.g.: "/auth/register_access/"+social_name

var fs = require('fs')
var globals = require('./globals.js')
var req_list = globals.req_list
var log = globals.log



/* tokens that will be used to verify pin are saved in req_list. token1 and token2 are URLencoded
 */
function start(social_id, req, res) {
  var t1 = req.query.token1
  var t2 = req.query.token2
  
  log('Saving request tokens for '+social_id+' authentication ')
  
  if (typeof(t1)=='undefined' || typeof(t2)=='undefined'){
    res.send({result:"no", msg:'Bad request body while saving twitter request tokens to cookies'})
    return
  }
  
  req_list[social_id][t1] = t2
  
  res.send('<html> <script>console.log("yes, saved request tokens to req_list for '+social_id+'"); '+
            'window.close();</script> </html>')
}




/* OAuth redirect page
 */
function oauth_landing(social_id, social_name, req, res) {
  var pin = req.query.oauth_verifier
  var token1 = req.query.oauth_token
  
  log('Getting pin from list for '+social_id+' authentication')
  
  if (typeof(pin)=='undefined' || typeof(token1)=='undefined'){
    res.send({result:"no", msg:'Bad request params while getting from URL'})
    return
  }
  
  var token2 = req_list[social_id][token1]
  if (typeof(token2)=='undefined') {
    res.send({result:"no", msg:'Bad value in req_list while getting '+social_id+' request tokens'})
    return
  }
  
  // Deleting entry token1:token2 from req_list
  delete req_list[social_id][token1]
  
  fs.readFile('MainServer/res/auth.html', 'utf8', function (err,data) {
    if (err) { return console.log(err) }
    var result = data.replace("<!--TOKEN_1-PLACEHOLDER-->", token1)
    result = result.replace("<!--TOKEN_2-PLACEHOLDER-->", token2)
    result = result.replace("<!--SOCIAL-PLACEHOLDER-->", social_name)
    result = result.replace("<!--PIN-PLACEHOLDER-->", pin)
    result = result.replace("<!--WEBSOCKET-PORT-PLACEHOLDER-->", globals.ws_ports[social_id])
    res.send(result)
  })
}




/* After a successful auth the server register access tokens in cookies. 
 *   request body (JSON):
 *   {
 *      token1: 'token1',
 *      token2: 'token2'
 *   }
*/
function register_access(social_id, req, res) {
  var t1 = req.body.token1
  var t2 = req.body.token2

  log('Registering access to '+social_id)

  if (typeof(t1)=='undefined' || typeof(t2)=='undefined'){
    res.send({result:"no", msg:'Bad request body while registering access'})
    return
  }

  // If there are not cookies create a new one
  var cookie = req.cookies.route
  if (typeof(cookie)=='undefined' || typeof(cookie.logged)=='undefined' ) {
    cookie = {}
    cookie.logged = []
  }
  
  // Add new social field to cookie
  cookie[social_id] = {}
  cookie[social_id].token1 = t1
  cookie[social_id].token2 = t2
  if (!cookie.logged.includes(social_id))
    cookie.logged.push(social_id)
  res.cookie('route', cookie)
  
  res.send('<html> <script>console.log("yes, registered to '+social_id+'"); '+
            'window.close();</script> </html>')
}



// esporto le funzioni
module.exports = {
  start,
  oauth_landing,
  register_access
}