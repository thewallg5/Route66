# Route66
Route66 è un'applicazione web che utilizza oAuth per garantire un accesso sicuro a molti social network come twitter, tumblr e flickr.
Gli utenti possono accedere autorizzando Route66 a leggere le informazioni del proprio profilo senza salvarle e in modo protetto per pubblicare immagini e/o testi (ove supportati).
La pagina web cui l'utente si connette e che fornisce il servizio è <a href="https://github.com/thewallg5/Route66/blob/master/app/index.html">Route66</a>.

### Authors

- Oliveri Costanza
- Ursini Gabriele
- Vellei Gabriele 

### How to run

__Dipendenze:__ node.js, rabbitmq

__Porte richieste:__ 8080, 5672

1. installare [node.js](https://nodejs.org/it/download/)
2. installare [rabbitmq](https://www.rabbitmq.com/#getstarted)
3. Spostarsi nella cartella principale in app e lanciare `npm install`
4. Lanciare il server rabbitmq secondo le modalità del proprio Sistema Operativo 
5. Far partire Route66 con `node server.js twitter_queue.js tumblr_queue.js flickr_queue.js`
6. Ora il servizio è accessibile in [localhost](http://localhost:8080)

### License

Il progetto è sotto la [Licensa MIT](https://github.com/thewallg5/Route66/blob/master/LICENSE)
