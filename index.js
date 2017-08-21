/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-08-09
* Updated at  : 2017-08-21
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var parser = require("./src/parser");

module.exports = function (source, indent, tab_space) {
	var line_break = '', current_indent = '', indentation = '',
		nodes = parser(source, tab_space),
		last = nodes.pop(), i = nodes.length, result;

	if (indent) {
		current_indent = indent.indent || '';

		if (indent.type) {
			switch (indent.type) {
				case "tab" :
					indentation = '\t';
					break;
				case "space" :
					tab_space = indent.space || 4;
					while (tab_space--) {
						indentation += ' ';
					}
					break;
			}
		} else {
			indentation = '\t';
		}

		line_break = '\n';
	}

	if (last) {
		result = last.compile(current_indent, indentation);
	}

	while (i--) {
		result = `${ nodes[i].compile(current_indent, indentation) }${ line_break }${ result }`;
	}

	return result;
};
