/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : events.js
* Created at  : 2017-08-25
* Updated at  : 2017-08-28
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var Events = function () {
	this.keys   = [];
	this.values = {};
};

Events.prototype = {
	set : function (key, value) {
		if (this.keys.indexOf(key) === -1) {
			this.keys.push(key);
		}
		this.values[key] = value;
	},
	clone : function () {
		var events = new Events(),
			keys   = this.keys,   _keys   = events.keys,
			values = this.values, _values = events.values,
			i = keys.length;

		while (i--) {
			_keys[i]         = keys[i];
			_values[keys[i]] = values[keys[i]];
		}

		return events;
	}
};

module.exports = Events;
