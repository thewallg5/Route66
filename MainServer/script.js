
//check se ho selezionato almeno un social
function validaPost() {
	if(!document.getElementById("twt").checked && !document.getElementById("tmb").checked && !document.getElementById("fkr").checked){
		alert("No social selected");
		return false;
	}
	return true;
}


function checkCookie(social) {
	var cookie = document.cookie;
	if(cookie=="") {
		alert("No cookies");
		return false;
	}
	if(cookie.search(social) != -1) {
		return true;
	}
	return false;
}


function gotoServer(method, path, params) {
	
	var form = document.createElement("form");
	form.setAttribute("method", method);
	form.setAttribute("action", path);        

	for(var key in params) {
		if(params.hasOwnProperty(key)) {
			var hiddenField = document.createElement("input");
			hiddenField.setAttribute("type", "hidden");
			hiddenField.setAttribute("name", key);
			hiddenField.setAttribute("value", params[key]);

			form.appendChild(hiddenField);
		}
	}

	document.body.appendChild(form);
	form.submit();
}



	
	// TWITTER AUTHENTICATION		
function log_on_twitter() {
	if ("WebSocket" in window) {
		var isLogged = checkCookie("twt");

		if(isLogged == true) {
			alert("You are already logged on Twitter");
		}
		else {
			auth_twt();
		}
	} else {
		alert("WebSocket not supported by this Browser");
	} 
}

function auth_twt() {	
	var ws_twt = new WebSocket('ws://localhost:12345'); 
    
    ws_twt.onopen = function() {
      ws_twt.send("auth");
    };
    

    ws_twt.onmessage = function(event) {
		data= event.data.split("\xFF");
		// twt/flag/auth/flag/url/flag/token1/flag/token2
		url = data[2];
		token1 = data[3];		//->request token
		token2 = data[4];		//->request token secret
		data = {
			"token1" : token1,
			"token2" : token2
		}
		gotoServer("get","http://localhost/auth/start/twitter",data);
		window.open(url);
		
    };
    
    ws_twt.onclose = function() {
    };
    
    ws_twt.onerror = function() {
      alert("Connection error");
    };
}



	// TUMBLR AUTHENTICATION
function log_on_tumblr() {
	if ("WebSocket" in window) {
		var isLogged = checkCookie("tmb");

		if(isLogged == true) {
			alert("You are already logged on Tumblr");
		}
		else {
			auth_tmb();
		}
	} else {
		alert("WebSocket not supported by this Browser!");
	} 
}

function auth_tmb() {	
	var ws_tmb = new WebSocket('ws://localhost:12346');
    
    ws_tmb.onopen = function() {
      	ws_tmb.send("auth");
    };
    
    ws_tmb.onmessage = function(msg) {
      	data = msg.data.split("\xFF");
      	if(data.length != 5) {
      		alert("auth error")
      		return
      	}
		// tmb/flag/auth/flag/url/flag/token1/flag/token2
		url = data[2];
		token1 = data[3];
		token2 = data[4];
		data = {
			"token1" : token1,
			"token2" : token2
		}
		gotoServer("get","http://localhost/auth/start/tumblr",data);
		window.open(url);
      
    };
    
    ws_tmb.onclose = function() {
    };
    
    ws_tmb.onerror = function() {
        alert("Connection error");
    };
}



	// FLICKR AUTHENTICATION
function log_on_flickr(){
	if ("WebSocket" in window){
		var isLogged = checkCookie("fkr");

		if(isLogged == true){
			alert("You are already logged on Flickr");
		}
		else {
			auth_fkr();
		}
	} else {
		alert("WebSocket not supported by this Browser!");
	} 
}

function auth_fkr(){	
	var ws_fkr = new WebSocket('ws://localhost:12347');
    
    ws_fkr.onopen = function(){
      ws_fkr.send("auth");
    };
    
    ws_fkr.onmessage = function(event){
      data= event.data.split("\xFF");
		// fkr/flag/auth/flag/url/flag/token1/flag/token2
		url = data[2];
		token1 = data[3];
		token2 = data[4];
		data = {
			"token1" : token1,
			"token2" : token2
		}
		gotoServer("get","http://localhost/auth/start/flickr",data);
		window.open(url);
      
    };
    
    ws_fkr.onclose = function(){
    };
    
    ws_fkr.onerror = function(){
        alert("Connection error");
    };
}

function log_out(){
	var cookies = document.cookie;
	if(cookies==""){
		alert("You are not logged on any social");
	}
	else {
		$.ajax({
			type: "DELETE",
			url: "http://localhost/auth/access",
			success: function(msg){
				alert("Logout successful!");
			}
		});
	}
}