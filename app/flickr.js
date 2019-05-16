var request = require('request');
var extend = require('deep-extend');

function Flickr(options) {
	this.options = options;

	this.authentication_options = {
		oauth: {
			consumer_key: "23c71e25b96c7a2894d42a51ce3fb511",
			consumer_secret: "92ebd7ccc3d4dee4",
			token: this.options.access_token_key,
			token_secret: this.options.access_token_secret
		}
	};

	this.request = request.defaults(extend(this.authentication_options));
}

Flickr.prototype.post = function(params, url, callback) {
	var options = {
		method: 'post',
		url: url,
		'form': params
	};

	this.request(options, function(error, response, body) {
		if(error)
			callback(error, response, body);
        else
            callback(null, response, body);
	});
}

module.exports = {
    Flickr
}