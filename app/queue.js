var amqp = require('amqplib/callback_api');


function send(social, msg, auth_options) {
	amqp.connect("amqp://localhost", function(err, conn) {
		conn.createChannel(function(err, ch) {

			var ex = 'exchg';

			ch.assertExchange(ex, 'direct', {durable: true});

			//txt || img_path || access_token || access_token_secret
			var m = [msg.txt, msg.path, auth_options.access_token_key, auth_options.access_token_secret].join('0xFF');
			ch.publish(ex, social, Buffer.from(m));

			console.log('Sent msg to '+social+' queue');

		});
	});
}

module.exports = {
    send
}
