var request = require('request');
var extend = require('deep-extend');

function Twitter(options) {

	this.options = options;

	this.authentication_options = {
		oauth: {
			consumer_key: "K5zop9SI6nMHjaHR0OpUVxVOb",
			consumer_secret: "vNeXNWaGKBwKpUTEgMsthGHoz35ADANl95r9EMhQqQSe16884f",
			token: this.options.access_token_key,
			token_secret: this.options.access_token_secret
		}
	};

	this.request = request.defaults(extend(this.authentication_options));
}

Twitter.prototype.post = function(params, url, callback) {
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
    Twitter
}
