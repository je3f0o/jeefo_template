/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : element.js
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

var Events     = require("../events"),
	dash_case  = require("jeefo_utils/string/dash_case"),
	ClassList  = require("../class_list"),
	Attributes = require("../attributes"),
	end_cursor = require("./end_cursor"),

	DELIMITERS       = ".,>+^[]() = \"'#{}",
	WHITESPACE_REGEX = /\s+/,

// Identifier {{{1
parse_identifier = function (streamer) {
	var character   = streamer.current(),
		start_index = streamer.cursor.index, end;

	while (character && character > ' ' && DELIMITERS.indexOf(character) === -1) {
		end       = streamer.get_cursor();
		character = streamer.next();
	}
	streamer.cursor = end;

	return streamer.seek(start_index, end.index + 1);
},

// Value {{{1
parse_value = function (streamer) {
	var quote       = streamer.current(),
		character   = streamer.next(),
		start_index = streamer.cursor.index;

	for (; character && character !== quote; character = streamer.next()) {
		if (character === '\\') {
			streamer.next();
		}
	}
	return streamer.seek(start_index);
},

// Content {{{1
parse_content = function (streamer) {
	var character = streamer.next(), content;
	if (character === '"' || character === "'") {
		content = parse_value(streamer);
		streamer.next(true);
	}
	return content;
},

// Attrs {{{1
parse_attrs = function (streamer, token) {
	var character = streamer.next(true),
		attrs  = token.attrs,
		events = token.events,
		i, key, value;

	while (character && character !== ']') {
		if (character === '(') {
			streamer.next(true);
			key = parse_identifier(streamer);
			character = streamer.next(true);

			if (character !== ')') {
				throw new SyntaxError("[JeefoTemplate]: Invalid syntax error.");
			}

			character = streamer.next(true);
			if (character === '=') {
				streamer.next(true);
				value = parse_value(streamer);
				character = streamer.next(true);
			} else {
				throw new SyntaxError("[JeefoTemplate]: Invalid syntax error, empty event.");
			}

			events.set(key, value);
		} else {
			key = dash_case(parse_identifier(streamer));

			character = streamer.next(true);

			if (character === '=') {
				streamer.next(true);
				value = parse_value(streamer);
				character = streamer.next(true);
			} else if (key === "class") {
				throw new SyntaxError("[JeefoTemplate]: Expected class value.");
			} else {
				value = null;
			}

			if (key === "class") {
				key   = token.class_list.list;
				value = new ClassList(value.split(WHITESPACE_REGEX));

				for (i = 0; i < key.length; ++i) {
					value.add(key[i]);
				}

				token.class_list = value;
			} else {
				attrs.set(key, value);
			}
		}

		while (character === ',') {
			character = streamer.next(true);
		}
	}
};
// }}}1

module.exports = {
	protos : {
		type       : "Element",
		initialize : function (character, streamer) {
			var start = streamer.get_cursor(), end, _class;

			this.type       = this.type;
			this.attrs      = new Attributes();
			this.events     = new Events();
			this.class_list = new ClassList();

			switch (character) {
				case '.':
				case '#':
				case '[':
				case '(':
				case '+':
				case '>':
				case '^':
					this.name = null;
					break;
				default:
					this.name = parse_identifier(streamer);
					end       = streamer.get_cursor();
					character = streamer.next(true);
			}

			LOOP:
			while (true) {
				switch (character) {
					case '.' :
						streamer.next(true);
						_class = parse_identifier(streamer);
						this.class_list.add(_class);
						end       = streamer.get_cursor();
						character = streamer.next(true);
						break;
					case '#' :
						this.id   = parse_identifier(streamer);
						end       = streamer.get_cursor();
						character = streamer.next(true);
						break;
					default:
						break LOOP;
				}
			}

			if (character === '[') {
				parse_attrs(streamer, this);
				end       = streamer.get_cursor();
				character = streamer.next(true);
			}

			if (character && character === '(') {
				this.content = parse_content(streamer);
				end = streamer.get_cursor();
			}

			this.start = start;
			this.end   = end_cursor(end);

			streamer.cursor = end;
		}
	}
};
