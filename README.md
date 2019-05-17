# Route66
Route66 è un'applicazione web che utilizza oAuth per garantire un accesso sicuro a molti social network come twitter e tumblr.
Gli utenti possono accedere autorizzando Route66 a leggere le informazioni del proprio profilo e pubblicare immagini e/o testi (ove supportati).
La pagina web cui l'utente si connette e che fornisce il servizio è Route66.

### Authors

- Oliveri Costanza
- Ursini Gabriele
- Vellei Gabriele 

### HOW TO RUN

Dipendenze: node.js, rabbitmq

Porte richieste: 8080, 5672

Packages 
Route66 contiene al suo interno un file package.json che permette di installare tutti i packages necessari una volta aperta la cartella nel terminale, questo mediante il comando 
            npm install 

Di seguito sono riportati tutti i packages che vengono scaricati dal comando e che l’applicazione necessita per funzionare

- EXPRESS
Framework per applicazioni web Node.js

- EXPESS-SESSION	 			        
Modulo Node.js disponibile attraverso il registro di npm.

- BODY PARSER				
Node.js body parsing middleware.                              
L'oggetto bodyParser espone vari fattori per creare middleware.
Tutti i middleware popoleranno la proprietà req.body con il corpo analizzato quando l'intestazione della richiesta Content-Type corrisponde all'opzione type o ad un oggetto vuoto ({}).
Se non vi è alcun corpo da analizzare, Content-Type o non è stato trovato, o si è verificato un errore. 


- MULTER			
Middleware node.js per la gestione di multipart / form-data, che viene utilizzato principalmente per il caricamento di file.
È scritto sopra il busboy [Un modulo node.js per l'analisi dei dati dei moduli HTML in arrivo] per la massima efficienza.

- OAUTH
Semplice API oauth per node.JS. Permette all’user di autenticarsi con i providers OAuth e comportarsi come un utilizzatore OAuth. 

- AMQPLIB da RabbitMQ
A library for making AMQP 0-9-1 clients for Node.JS, and an AMQP 0-9-1 client for Node.JS v0.8-0.12, v4-v9, and the intervening io.js releases.

- BASE64-IMG			     					       
Converte img in base64 o converte base64 in img

- DEEP_EXTEND							    
Estensione ricorsiva dell'oggetto.

- FS					                      
Questo modulo rende le operazioni delle api semplici, non è necessario preoccuparsi delle uscite dir . e l'api è uguale al nodo del filesystem.

- REQUEST								     
Request è progettata per essere il modo più semplice per effettuare chiamate http.
Supporta HTTPS e segue i reindirizzamenti per impostazione predefinita.

### License

Il progetto è sotto la [Licensa MIT](https://github.com/thewallg5/Route66/blob/master/LICENSE)
      
#### Logo copyright
da aggiornare
