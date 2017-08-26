/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : comment.js
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
	is     : function (character) { return character === '{'; },
	protos : {
		type       : "Comment",
		precedence : 1,
		initialize : function (character, streamer) {
			this.type = this.type;

			var start = streamer.get_cursor(), start_index, end_index;

			character   = streamer.next(true);
			start_index = streamer.cursor.index;

			while (character && character !== '}') {
				end_index = streamer.cursor.index;
				character = streamer.next(true);
			}

			this.comment = streamer.seek(start_index, end_index + 1);

			this.start = start;
			this.end   = end_cursor(streamer.get_cursor());
		}
	}
};
