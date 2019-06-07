var express = require('express');
var bodyParser = require('body-parser');
var oauth = require('oauth');
var fs = require('file-system');        //aggiungi codice per prelevare chiavi twt/tmb l8r
var multer = require('multer');			//interazione con il form
var upload = multer({ dest: 'uploads/' })
var session = require('express-session');
var queue = require('./queue.js');
var path = require('path'); //CSS [Funziona per l'avvio, ma non al redirect]

//var serviceInfo = require('service_info');


var app = express();
app.use(express.static(path.join(__dirname, 'css'))); //CSS [Funziona per l'avvio, ma non al redirect]

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session( {
	secret: 'muchsecret',
	resave: false,
	saveUninitialized: true
} ));


var msgs = [];
var req_list = {twt:{}, tmb:{}, flk:{}};

class Msg {
	constructor(oauthToken, txt, path) {
		this.txt = txt;
		this.path = path;
		this.oauthToken = oauthToken;
	}
}

function consumer(social) {
	switch(social) {
		case 'twt':
		return new oauth.OAuth("https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
        	"K5zop9SI6nMHjaHR0OpUVxVOb", "vNeXNWaGKBwKpUTEgMsthGHoz35ADANl95r9EMhQqQSe16884f", "1.0A",
        	"http://127.0.0.1:8080/sessions/callback?social=twt", "HMAC-SHA1");

		case 'tmb':
            	return new oauth.OAuth("https://www.tumblr.com/oauth/request_token", "https://www.tumblr.com/oauth/access_token",
            	"DLYFx2gqOL1s3gWprrDrQyNs0Hh5tmOFlH0I74e6HStCmCjGZR", "nT7LqTkSrCdtusSYs7V2wv1TRgipBZ9p66vzyXtamklPGckw3B", "1.0A",
		"http://127.0.0.1:8080/sessions/callback?social=tmb", "HMAC-SHA1");
		
		case 'flk':
		return new oauth.OAuth("https://www.flickr.com/services/oauth/request_token", "https://www.flickr.com/services/oauth/access_token",
        	"23c71e25b96c7a2894d42a51ce3fb511", "92ebd7ccc3d4dee4", "1.0A",
		"http://127.0.0.1:8080/sessions/callback?social=flk", "HMAC-SHA1");
	}
}

app.get('/', function(req, res) {
    res.redirect('/home');		//reinderizza una richiesta. res.redirect([status,] path), se status non menzionato è 302 di defult
});

app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/index.html');    //Inviare un file come un flusso di ottetti. res.sendFile(path [, options] [, fn])
});


app.post('/sessions/connect/twitter', upload.single('img'), function(req, res) {
	
	consumer('twt').getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
		if(error) {
			console.log(error);
			res.status(500).send("Twitter: failed trying request OAuth token: "+error)
		}
		else {

			req_list['twt'][oauthToken] = oauthTokenSecret;
			console.log("Twitter: got OAuth token: "+oauthToken+"\n");
			var path = typeof(req.file);
			if(path == 'undefined') path = "";
			else path = req.file.path;

			msgs.push(new Msg(oauthToken, req.body.text, path));
			res.redirect("https://twitter.com/oauth/authorize?oauth_token="+oauthToken);
		}
	});
});

app.post('/sessions/connect/tumblr', upload.single('img'), function(req, res) {
	
	consumer('tmb').getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
		if(error) {
			console.log(error);
			res.status(500).send("Tumblr: failed trying request OAuth token: "+error)
		}
		else {

			req_list['tmb'][oauthToken] = oauthTokenSecret;
			console.log("Tumblr: got OAuth token: "+oauthToken+"\n");
			var path = typeof(req.file);
			if(path == 'undefined') path = "";
			else path = req.file.path;

			msgs.push(new Msg(oauthToken, req.body.text, path));
			res.redirect("https://tumblr.com/oauth/authorize?oauth_token="+oauthToken);
		}
	});
});

app.post('/sessions/connect/flickr', upload.single('img'), function(req, res) {
	
	consumer('flk').getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
		if(error) {
			console.log(error);
			res.status(500).send("Flickr: failed trying request OAuth token: "+error)
		}
		else {

			req_list['flk'][oauthToken] = oauthTokenSecret;
			console.log("Flickr: got OAuth token: "+oauthToken+"\n");
			var path = typeof(req.file);
			if(path == 'undefined') path = "";
			else path = req.file.path;

			msgs.push(new Msg(oauthToken, req.body.text, path));
			res.redirect("https://www.flickr.com/services/oauth/authorize?oauth_token="+oauthToken);
		}
	});

});

app.get('/sessions/callback', function(req, res) {

    	var oauthRequestToken = req.query.oauth_token;
	var social = req.query.social;

	consumer(social).getOAuthAccessToken(oauthRequestToken, req_list[social][oauthRequestToken], req.query.oauth_verifier, function(error,oauthAccessToken, oauthAccessTokenSecret, results) {
		if(error) {
			console.log(error);
			res.status(500).send(social+": failed trying request access token: "+error);
		}
		else {

			req.session.oauthAccessToken = oauthAccessToken;
			req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;

			consumer(social).get(redirVer(social), oauthAccessToken, oauthAccessTokenSecret,function (error, data, response) {
				if(error) {
					res.status(500).send(error);
					console.log("errore");
				}
				else {

					var msgToPost;
					for(var i=0;i<msgs.length;i++) {
					    if(msgs[i].oauthToken == oauthRequestToken) {
						msgToPost = msgs[i];
						break;
					    }
					}

					var auth_options = {
					    access_token_key: oauthAccessToken,
					    access_token_secret: oauthAccessTokenSecret
					};

					queue.send(social, msgToPost, auth_options);  //entriamo in queue.js
					res.send("<html><head></head><body>Posted successfully on "+social+"</body></html>");
			    	}
			});
		}
	});
});

function redirVer(social) {  //funzione che serve nel verificare quale social è all'interno dell' app.get
	if(social == 'twt')
		return "https://api.twitter.com/1.1/account/verify_credentials.json";
	if(social == 'tmb')
		return "http://127.0.0.1:8080/home";
	if(social == 'flk')
		return "http://127.0.0.1:8080/home";
}



app.listen(8080, function() {
	console.log(" ***       ****       *** ");
	console.log("*   *******    *******   *");
	console.log(" *                      * ");
    console.log("*   Welcome on Route66   *");
	console.log("* Listenin' on port 8080 *");
	console.log("*           66           *");
	console.log(" *                      * ");
	console.log("  *    ****     ****   *  ");
	console.log("    **      ***     **    ");
});
