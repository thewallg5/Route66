//non serve più
var request = require('request');
var extend = require('deep-extend');

function Tumblr(options) {
	this.options = options;

	this.authentication_options = {
		oauth: {
			consumer_key: "DLYFx2gqOL1s3gWprrDrQyNs0Hh5tmOFlH0I74e6HStCmCjGZR",
			consumer_secret: "nT7LqTkSrCdtusSYs7V2wv1TRgipBZ9p66vzyXtamklPGckw3B",
			token: this.options.access_token_key,
			token_secret: this.options.access_token_secret
		}
	};

	this.request = request.defaults(extend(this.authentication_options));
}

Tumblr.prototype.post = function(params, url, callback) {
	var options = {
		method: 'post',
		url: url,
		'form': params
	};

	this.request(options, function(error, data, response) {
		if(error)
			return callback(error, data, response);

		data = JSON.parse(data);
		callback(null, data, response);
	});
}

Tumblr.prototype.get = function(params, url, callback) {
	var options = {
		method: 'get',
		url: url,
		'form': params
	};

	this.request(options, function(error, data, response) {
		if(error)
			return callback(error, data, response);

		data = JSON.parse(data);
		callback(null, data, response);
	});
}

module.exports = {
    Tumblr
}
