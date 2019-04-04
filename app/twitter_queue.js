var amqp = require('amqplib/callback_api');
var twt = require("./twitter.js");
var base64Img = require('base64-img');
var fs = require('file-system');

amqp.connect('amqp://localhost', function(err, conn) {
	conn.createChannel(function(err, ch) {
		var ex = 'exchg';

		ch.assertExchange(ex, 'direct', { durable: true });
		ch.assertQueue('', { exclusive: true }, function(err, q) {
			ch.bindQueue(q.queue, ex, 'twt');

			ch.consume(q.queue, function(msg) {
                console.log("msg received by twt queue");
				var l = msg.content.toString().split('0xFF');
                console.log(l);
				var client = new twt.Twitter({
					consumer_key: "K5zop9SI6nMHjaHR0OpUVxVOb",
					consumer_secret: "vNeXNWaGKBwKpUTEgMsthGHoz35ADANl95r9EMhQqQSe16884f",
					access_token_key: l[2],
					access_token_secret: l[3]
				});



                console.log("checking img");

                if(l[1].length > 0) {

                    var data = fs.readFileSync(__dirname + '/' + l[1], { encoding: 'base64' });

                    console.log("Uploading img...");
					client.post({ 'media_data': data }, 'https://upload.twitter.com/1.1/media/upload.json',
                        function(err, res, body) {
                            if(err) console.log(err);
                            console.log("RES:"+JSON.stringify(res));
                            console.log("BODY:"+body);
                            var media_id = JSON.parse(body)["media_id_string"];


                            var params = {
                                'media_ids': new Array(media_id),
                                'status': l[0]

                            };

                            console.log(params);

                            console.log("Ready 2 post");
                            client.post(params, 'https://api.twitter.com/1.1/statuses/update.json', function(err, tweet, response) {
                                if(err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("TWEET: "+JSON.stringify(tweet));
                                    console.log("RES: "+response);
                                    console.log("Posted successfully on Twitter");
                                }
                            });
                    });
				}

				else {
					var params = { 'status': l[0] };
                    console.log("No img");
                    console.log("Ready 2 post");
                    client.post(params, 'https://api.twitter.com/1.1/statuses/update.json', function(err, tweet, response) {
                        if(err) {
                            console.log(err);
                        }
                        else {
                            console.log("Posted successfully on Twitter");
                        }
                    });
                }

			}, { noAck: true });
		});
	});
});
