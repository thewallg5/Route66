const websocket = require('ws')
const https = require('https')
const oauth = require('oauth')

const flag

const server = https.createServer()

const wss = new websocket.Server({server})

function consumer() {
	return new oauth.Oauth("https://twitter.com/oauth/request_token", "https://twitter.com/oauth/access_token",
        _twitterConsumerKey, _twitterConsumerSecret, "1.0A", "http://127.0.0.1:8080/auth/landing/twitter", "HMAC-SHA1");
}

wss.on('connection', function(ws) {
	ws.on('message', function(msg) {
		l = msg.split(flag)

		switch(l[0]) {
			case 'auth':
				twitter = consumer().getOauthRequestToken(function(error, oauthToken, oauthTokenSecret, results) {
					if(error) ws.send('twt'+flag+'auth'+flag+'error')
					else
						ws.send('twt'+flag+'auth'+flag+'https://twitter.com/oauth/authorize?oauth_token='+oauthToken+flag+oauthToken+flag+oauthTokenSecret)
				})
			case 'verify_pin':
				consumer().getOauthAccessToken(l[2], l[3], l[1], function(error, oauthAccessToken, oauthAccessTokenSecret, results) {
					if(error) ws.send('twt'+flag+'verify_pin'+flag+'error')
					else {
						token1 = oauthAccessToken
						token2 = oauthAccessTokenSecret
						ws.send('twt'+flag+'verify_pin'+flag+token1+flag+token2)
					}
				})
			default:
				ws.send('twt'+flag+'op_not_supp')
		}
	})
})

server.listen(12345)

