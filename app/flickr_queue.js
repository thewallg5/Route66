var amqp = require('amqplib/callback_api');
var fs = require('file-system');
var flk= require('./flickr.js');

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

                var client = new flk.Flickr({
					consumer_key: "23c71e25b96c7a2894d42a51ce3fb511",
					consumer_secret: "92ebd7ccc3d4dee4",
					access_token_key: l[2],
					access_token_secret: l[3]
				});



                console.log("checking img");

                    //var data = fs.readFileSync(__dirname + '/' + l[1], { encoding: 'base64' });

                    console.log("Uploading img...");
					/*client.post({ 'media_data': data }, 'https://up.flickr.com/services/upload/',function(err, res, body) {
                            if(err) console.log(err);
                            
                            console.log("RES:"+JSON.stringify(res));
                            console.log("BODY:"+body);
                           // var media_id = JSON.parse(body)["media_id_string"];*/


                            var params ={
                                photos: [{
                                  title: "Postato da Route66",
                                  description: l[0],
                                  photo: l[1]
                                }]
                            };
                            /*{
                                'title': "Postato da Route66",
                                'description': l[0],
                                photo: l[1]

                            };*/

                            console.log(params);
                            console.log(l);

                            console.log("Ready 2 post");
                            client.post(params, 'https://up.flickr.com/services/upload/', function(err, post, response) { //?media_id='+media_id
                                if(err) {
                                    console.log(err);
                                }
                                else {
                                    console.log("POST: "+JSON.stringify(post));
                                    console.log("RES: "+response);
                                    console.log("Posted successfully on Flickr");
                                }
                        
                    });


            
				

}, { noAck: true }); //se è vero, il broker non si aspetta un riconoscimento dei messaggi consegnati a questo consumatore
		});
	});
});