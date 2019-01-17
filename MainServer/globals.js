// CHIAMATO DAL MAINSERVER
// contiene variabili e funzioni globali del mainserver


// per stampare informazioni di debug
const debug_stdout = true

// in ascolto di connessioni sulla porta
const port = 80

// websocket ports
const ws_ports = {twt:"12345", tmb:"12346", fkr:"12347"}  //SAVE PORTS AS STRINGS


// unique message identifier, to be used when communicating with queues
var msg_id = 0

function request_msg_id() {
  msg_id++
  return msg_id
}


// logging
var fs = require('fs')  // filesystem library

function log(msg) {
  //var entry = '[MainServer] '+new Date+' | '+msg
  if (debug_stdout)
	console.log(msg)
  fs.appendFile('mainserver.log', msg+'\n', (err) => {if (err) console.log('Error writing on logfile')})
}

// Temporary object where request tokens are stored
var req_list = {twt:{}, tmb:{}, fkr:{}}



// esporto
module.exports = {
  request_msg_id,
  ws_ports,
  req_list,
  port,
  log
}