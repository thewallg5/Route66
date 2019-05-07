var express = require('express');
var bodyParser = require('body-parser');
var oauth = require('oauth');
var fs = require('file-system');        //aggiungi codice per prelevare chiavi twt/tmb l8r
var multer = require('multer');			//interazione con il form
var upload = multer({ dest: 'uploads/' })
var session = require('express-session');
var queue = require('./queue.js');

//var serviceInfo = require('service_info');


var app = express();

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session( {
	secret: 'muchsecret',
	resave: false,
	saveUninitialized: true
} ));


var msgs = [];

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
	}

}

app.get('/', function(req, res) {
    res.redirect('/home');		//reinderizza una richiesta. res.redirect([status,] path), se status non menzionato è 302 di defult
});

app.get('/home', function(req, res) {
    res.sendFile(__dirname + '/index.html');    //Inviare un file come un flusso di ottetti. res.sendFile(path [, options] [, fn])
});


app.post('/sessions/connect', upload.single('img'), function(req, res) {
	var req_list = [];
	if(req.body.twt == 'on') req_list.push('twt');	//controllo nel form se twt o tmb sono selezionati e li metto nell'array...
	if(req.body.tmb == 'on') req_list.push('tmb');

	req_list.forEach(function(social) {
		consumer(social).getOAuthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
			if(error) {
				console.log(error);
				res.status(500).send(social+": failed trying request OAuth token: "+error)
			}
			else {

                req.session.oauthRequestToken = oauthToken;
                req.session.oauthRequestTokenSecret = oauthTokenSecret;
				console.log(social+": got OAuth token: "+oauthToken+"\n");
                var path = typeof(req.file);
                if(path == 'undefined') path = "";
                else path = req.file.path;

				msgs.push(new Msg(req.session.oauthRequestToken, req.body.text, path));
				res.redirect(redirUrl(social, req.session.oauthRequestToken));
			}
		});
	});
});

function redirUrl(social, oauthToken) {  //funzione che serve nel redirect all'interno dell' app.post
	if(social == 'twt')
		return "https://twitter.com/oauth/authorize?oauth_token="+oauthToken;
	if(social == 'tmb')
		return "https://www.tumblr.com/oauth/authorize?oauth_token="+oauthToken;
}

app.get('/sessions/callback', function(req, res) {

    var oauthRequestToken = req.query.oauth_token;
	var social = req.query.social;
    //console.log(social);

	consumer(social).getOAuthAccessToken(req.session.oauthRequestToken, req.session.oauthRequestTokenSecret, req.query.oauth_verifier, function(error,oauthAccessToken, oauthAccessTokenSecret, results) {
		if(error) {
			console.log(error);
			res.status(500).send(social+": failed trying request access token: "+error);
		}
		else {

            req.session.oauthAccessToken = oauthAccessToken;
            req.session.oauthAccessTokenSecret = oauthAccessTokenSecret;
		
			//prima consumer(social).get("https://api.twitter.com/1.1/account/verify_credentials.json", req.session.oauthAccessToken, req.session.oauthAccessTokenSecret,function (error, data, response) {
            consumer(social).get(redirVer(social), req.session.oauthAccessToken, req.session.oauthAccessTokenSecret,function (error, data, response) {
                    if(error) {
						res.status(500).send(error);
						console.log("errore");
                    }
                    else {
		
                        var msgToPost;
                        for(var i=0;i<msgs.length;i++) {
                            if(msgs[i].oauthToken == req.session.oauthRequestToken) {
								msgToPost = msgs[i];
                                break;
                            }
                        }

                        var auth_options = {
                            access_token_key: req.session.oauthAccessToken,
                            access_token_secret: req.session.oauthAccessTokenSecret
                        };
						
                        queue.send(social, msgToPost, auth_options);  //entriamo in queue.js
                        res.redirect('/home');
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
