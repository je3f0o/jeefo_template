/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : events.js
* Created at  : 2017-08-25
* Updated at  : 2017-08-25
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
};

module.exports = Events;
