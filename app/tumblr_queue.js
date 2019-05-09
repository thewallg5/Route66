var amqp = require('amqplib/callback_api');
var base64Img = require('base64-img');
var tumblr = require('tumblr.js');
var fs = require('file-system');
var nome;


amqp.connect('amqp://localhost', function(err, conn) { //apriamo una connessione
	conn.createChannel(function(err, ch) {  //e un canale 'ch'
		var ex = 'exchg';

		ch.assertExchange(ex, 'direct', { durable: true }); //un messaggio va alle code la cui binding key corrisponde esattamente alla routing key del messaggio
		ch.assertQueue('', { exclusive: true }, function(err, q) { //exclusive=true-> estende la coda alla connessione; se vuoto '' il server ne creerà una automaticamente
			ch.bindQueue(q.queue, ex, 'tmb'); //lo scambio 'ex' inoltrerà il msg alla queue 'q.queue' denominata, in base al tipo di scambio e al modello 'tmb' indicato

			ch.consume(q.queue, function(msg) {  //Imposta un consumatore con una callback da richiamare con ogni messaggio.

				console.log("msg received by tmb queue");
				var l = msg.content.toString().split('0xFF');
                console.log(l);

				const clUser = tumblr.createClient({
					consumer_key: 'DLYFx2gqOL1s3gWprrDrQyNs0Hh5tmOFlH0I74e6HStCmCjGZR',
					consumer_secret: "nT7LqTkSrCdtusSYs7V2wv1TRgipBZ9p66vzyXtamklPGckw3B",
					token: l[2],
					token_secret: l[3]
				  });
				
				
				clUser.userInfo(function(err, data) {
					data.user.blogs.forEach(function(blog) {
					  nome=blog.name;
					  console.log(nome);
					});
				  
				
				
				  
					console.log("checking img");

						if(l[1].length > 0) {
	
							var data = fs.readFileSync(__dirname + '/' + l[1], { encoding: 'base64' });
							var params = {
								'type': 'photo',
								'caption' : l[0],
								'data64' : data
							}
							//console.log(params);
	
							console.log("Uploading img...");

							console.log("Ready 2 post");
									clUser.createPhotoPost(nome,params,function(error, data, response){
										if(error) {
											console.log(error);
											}
										else {
											console.log("POST: "+JSON.stringify(data));
											console.log("RES: "+response);
											console.log("Posted successfully on tumblr");
											}
										});
								
							


						 }else {

							var params = { 
								'title': 'Posted by Route66',
								'body': l[0] 
							};

							console.log("No img");
							console.log("Ready 2 post");
							clUser.createTextPost(nome, params,function(error, data, response){
								if(error) {
									console.log(error);
								}
								else {
									console.log("POST: "+JSON.stringify(data));
									console.log("RES: "+response);
									console.log("Posted successfully on tumblr");
								}
							});
							
						}
				});

}, { noAck: true }); //se è vero, il broker non si aspetta un riconoscimento dei messaggi consegnati a questo consumatore
		});
	});
});


