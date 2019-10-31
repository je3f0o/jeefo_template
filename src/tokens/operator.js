/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : operator.js
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

const operator_characters = ">+^";

module.exports = {
    id       : "Operator",
    priority : 1,

	is         : character => operator_characters.includes(character),
    initialize : (token, current_character, streamer) => {
        token.operator = current_character;
        token.start    = streamer.clone_cursor_position();
        token.end      = streamer.clone_cursor_position();
    }
};
