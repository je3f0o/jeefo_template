/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : end_cursor.js
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

module.exports = function end_cursor (cursor) {
	return {
		line           : cursor.line,
		index          : cursor.index + 1,
		column         : cursor.column + 1,
		virtual_column : cursor.virtual_column + 1,
	};
};
