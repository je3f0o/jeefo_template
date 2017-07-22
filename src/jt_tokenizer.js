/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jt_tokenizer.js
* Created at  : 2017-04-10
* Updated at  : 2017-07-22
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

var jeefo = require("jeefo").create();
jeefo.use(require("jeefo_core"));
jeefo.use(require("jeefo_tokenizer"));

/* global */
/* exported */

// ignore:end

var jt = jeefo.module("jeefo.template", ["jeefo.tokenizer"]);

// Tokenizer {{{1
jt.namespace("jeefo_template.tokenizer", ["tokenizer.Tokenizer"], function (Tokenizer) {
	var tokenizer = new Tokenizer();

	var end_cursor = function (cursor) {
		return {
			line           : cursor.line,
			index          : cursor.index + 1,
			column         : cursor.column + 1,
			virtual_column : cursor.virtual_column + 1,
		};
	};

	tokenizer.
	// Operator {{{2
	register({
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
			end_cursor : end_cursor,
			initialize : function (character, streamer) {
				this.type     = this.type;
				this.operator = character;

				this.start = streamer.get_cursor();
				this.end   = this.end_cursor(this.start);
			},
		},
	}).

	// Comment {{{2
	register({
		is     : function (character) { return character === '{'; },
		protos : {
			type       : "Comment",
			precedence : 1,
			end_cursor : end_cursor,
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
				this.end   = this.end_cursor(streamer.get_cursor());
			},
		},
	}).

	// Element {{{2
	register({
		protos : {
			type       : "Element",
			delimiters : ".,>+^[]()=\"'#{}",
			end_cursor : end_cursor,
			// Initializer {{{3
			initialize : function (character, streamer) {
				var start = streamer.get_cursor(), end, _class;

				this.type = this.type;

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
						this.name = this.parse_identifier(streamer);
						end       = streamer.get_cursor();
						character = streamer.next(true);
				}

				this.class_list = [];

				LOOP:
				while (true) {
					switch (character) {
						case '.' :
							streamer.next(true);
							_class = this.parse_identifier(streamer);
							if (this.class_list.indexOf(_class) === -1) {
								this.class_list.push(_class);
							}
							end       = streamer.get_cursor();
							character = streamer.next(true);
							break;
						case '#' :
							this.id   = this.parse_identifier(streamer);
							end       = streamer.get_cursor();
							character = streamer.next(true);
							break;
						default:
							break LOOP;
					}
				}

				if (character === '[') {
					this.parse_attrs(streamer);
					end       = streamer.get_cursor();
					character = streamer.next(true);
				}

				if (character && character === '(') {
					this.parse_content(streamer);
					end = streamer.get_cursor();
				}

				this.start = start;
				this.end   = this.end_cursor(end);

				streamer.cursor = end;
			},

			// Identifier {{{3
			parse_identifier : function (streamer) {
				var character   = streamer.current(),
					start_index = streamer.cursor.index, end;

				while (character && character > ' ' && this.delimiters.indexOf(character) === -1) {
					end       = streamer.get_cursor();
					character = streamer.next();
				}
				streamer.cursor = end;

				return streamer.seek(start_index, end.index + 1);
			},

			// Content {{{3
			parse_content : function (streamer) {
				var character = streamer.next();
				if (character === '"' || character === "'") {
					this.content = this.parse_value(streamer);
					streamer.next(true);
				}
			},

			// Value {{{3
			parse_value : function (streamer) {
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

			// Attrs {{{3
			parse_attrs : function (streamer) {
				var attrs     = this.attrs = {},
					character = streamer.next(true), key, value;

				while (character && character !== ']') {
					key = this.parse_identifier(streamer);
					character = streamer.next(true);

					if (character === '=') {
						streamer.next(true);
						value = this.parse_value(streamer);
						character = streamer.next(true);
					} else {
						value = null;
					}

					while (character === ',') {
						character = streamer.next(true);
					}

					attrs[key] = value;
				}
			},
			// }}}3
		},
	});
	// }}}2

	return tokenizer;
});
// }}}1

// ignore:start
module.exports = jt;
// ignore:end
