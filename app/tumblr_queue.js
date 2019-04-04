var amqp = require('amqp/callback_api');
var tmb = require('./tumblr.js');
var base64Img = require('base64-img');


amqp.connect('amqp://localhost', function(err, conn) {
	amqp.createChannel(function(err, ch) {
		var ex  ='exchg';

		ch.assertExchange(ex, direct, { durable: true });
		ch.assertQueue('', { exclusive: true }, function(err, q) {
			ch.bindQueue(q.queue, ex, 'tmb');

			ch.consume(q.queue, function(msg) {
				var l = msg.split("0xFF");

				var client = new tmb.Tumblr({
					consumer_key: "DLYFx2gqOL1s3gWprrDrQyNs0Hh5tmOFlH0I74e6HStCmCjGZR",
					consumer_secret: "nT7LqTkSrCdtusSYs7V2wv1TRgipBZ9p66vzyXtamklPGckw3B",
					access_token_key: l[2],
					access_token_secret: l[3]
				});

				var r = client.get('http://api.tumblr.com/v2/user/info');
				if(JSON.stringify(r).contains('200')) {
					var name = r['response']['user']['name'];

					if(l[1].length > 0) var params = { 'type': 'photo', 'caption': l[0], 'data64': base64Img.base64(l[1]) };
					else var params = { 'title': 'prova123', 'body': l[0] };

					r = client.post(params, 'http://api.tumblr.com/v2/blog/'+name+'/post');
					if(!JSON.stringify(r).contains('201'))
						console.log("Exception occurred while posting on Tumblr");
					else
						console.log(JSON.stringify(r));

				}
				else
					console.log("Exception occurred while posting on Tumblr");

			}, { noAck: true });
		});
	});
});
