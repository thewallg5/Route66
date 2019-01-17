// CHIAMATO DAL MAINSERVER


// comunicazione con le code
var sleep = require('sleep')
var globals = require('./globals.js')
var amqp = require('amqplib/callback_api');
var rpc_handler = require('./rpc-handler.js').handler
var log = globals.log

/* Inoltra il messaggio alle code, ritorna una lista formata dai correlation_id
 * (forniti da rabbit) dei messaggi inviati
 * 
 * msg è il messaggio da inoltrare
 * social è la lista dei social network selezionati, seguendo l'id_api dentro RPC_FORMAT.md,
 *              quindi twitter 'twt', googleplus 'g+', facebook 'fb'
 *
 *              esempio, se la lista è ['twt', 'fb'] pubblicare solo su twitter e facebook
 */
function sendToQueues(msg, social) {

  amqp.connect('amqp://rabbitmq', function(err,conn) {
    conn.createChannel(function(err,ch) {
       
      var ex = 'exchange_name';
	  var to_server_queue = 'to_server';
    
      ch.assertExchange(ex, 'direct', {durable: true});
      ch.assertQueue(to_server_queue, {durable: true});
	
	  var msg_id = globals.request_msg_id().toString()	//aggiunto il toString perchè lo vuole come stringa
	  var real_msg = [msg_id, msg].join('\xFF');
	  ch.publish('', social, new Buffer(real_msg));
	  log('Sent msg_id:'+ msg_id + ' to queue:' + social); 
	  

      // get the results of the rpcs launched
	      
	      
      ch.assertQueue(to_server_queue, {durable:true});
      
      // reads message
      log('Waiting for RPC id: '+msg_id);
      ch.consume(to_server_queue, function(msg) {
	      var splitted_msg = msg.content.toString().split('\xFF');
		  log("Received "+msg_id)
	      if (splitted_msg[0] == msg_id) rpc_handler(splitted_msg.slice(1))
      }, {noAck:true});     
    });
  });
}



 
// TODO forse si può unire la funzione recvFromQueues in fondo a sendToQueues per evitare di riconnettersi



/*function recvFromQueues(correlation_id) {

  amqp.connect('amqp://rabbit-mq', function(err, conn) {
	  conn.createChannel(function(err,ch) {
		  var to_server_queue = 'to_server';
		  ch.assertQueue(to_server_queue, {durable:true});
		  
		  // reads a message
		  log('Waiting for RPC id:'+correlation_id)
		  ch.consume(to_server_queue, function(msg){
			if (msg.properies.correlationId == correlation_id)
			  rpc_handler(msg)
		  }, {noAck: true});
	  });
  });
}
*/


// esporto le funzioni
module.exports = {
  send: sendToQueues,
 // recv: recvFromQueues
}
