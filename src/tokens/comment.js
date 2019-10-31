/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : comment.js
* Created at  : 2017-08-26
* Updated at  : 2019-06-28
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

module.exports = {
    id       : "Comment",
    priority : 1,

	is         : character => character === '{',
    initialize : (token, current_character, streamer) => {
        const start = streamer.clone_cursor_position();

        let character = streamer.next(true);
        while (character && character !== '}') {
            character = streamer.next(true);
        }

        const end_index = streamer.cursor.position.index;
        const value = streamer.string.substring(start.index + 1, end_index);

        token.value = value.trim();
        token.start = start;
        token.end   = streamer.clone_cursor_position();
	}
};
