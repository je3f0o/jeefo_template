/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : operator.js
* Created at  : 2017-08-26
* Updated at  : 2017-08-26
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var end_cursor = require("./end_cursor");

module.exports = {
	is : function (character) {
		switch (character) {
			case '>':
			case '+':
			case '^':
				return true;
		}
	},
	protos : {
		type       : "Operator",
		precedence : 1,
		initialize : function (character, streamer) {
			this.type     = this.type;
			this.operator = character;

			this.start = streamer.get_cursor();
			this.end   = end_cursor(this.start);
		}
	}
};
