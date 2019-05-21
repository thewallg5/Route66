var amqp = require('amqplib/callback_api');
var fs = require('file-system');
var Flickr = require('flickrapi');

amqp.connect('amqp://localhost', function(err, conn) { //apriamo una connessione
	conn.createChannel(function(err, ch) {  //e un canale 'ch'
		var ex = 'exchg';

		ch.assertExchange(ex, 'direct', { durable: true }); //un messaggio va alle code la cui binding key corrisponde esattamente alla routing key del messaggio
		ch.assertQueue('', { exclusive: true }, function(err, q) { //exclusive=true-> estende la coda alla connessione; se vuoto '' il server ne creerà una automaticamente
			ch.bindQueue(q.queue, ex, 'flk'); //lo scambio 'ex' inoltrerà il msg alla queue 'q.queue' denominata, in base al tipo di scambio e al modello 'flk' indicato

			ch.consume(q.queue, function(msg) {  //Imposta un consumatore con una callback da richiamare con ogni messaggio.

				console.log("msg received by flk queue");
				var l = msg.content.toString().split('0xFF');
        
				console.log(l);

        console.log("Uploading img...");

        var FlickrOptions = {
          api_key: "23c71e25b96c7a2894d42a51ce3fb511",
          secret: "92ebd7ccc3d4dee4",
          access_token: l[2],
          access_token_secret: l[3]
        };

        var uploadOptions = {
	  			photos: [{
	    			title: l[0],
	    			description: "Posted with Route66",
	    			photo: __dirname + "/" + l[1]
	  			}]
				};
          
				Flickr.upload(uploadOptions, FlickrOptions, function(err, res) {
          if(err)
            return console.error(err);
          console.log("Posted successfully on Flickr");
        });

      }, { noAck: true }); //se è vero, il broker non si aspetta un riconoscimento dei messaggi consegnati a questo consumatore
		});
	});
});
