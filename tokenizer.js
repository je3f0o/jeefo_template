/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : tokenizer.js
* Created at  : 2017-04-10
* Updated at  : 2017-08-21
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* global */
/* exported */

// ignore:end

var dash_case = require("jeefo_utils/string/dash_case"),
	Tokenizer = require("jeefo_tokenizer"),
	tokenizer = new Tokenizer();

var end_cursor = function (cursor) {
	return {
		line           : cursor.line,
		index          : cursor.index + 1,
		column         : cursor.column + 1,
		virtual_column : cursor.virtual_column + 1,
	};
};

tokenizer.
// Operator {{{1
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

// Comment {{{1
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

// Element {{{1
register({
	protos : {
		type       : "Element",
		delimiters : ".,>+^[]()=\"'#{}",
		end_cursor : end_cursor,
		// Initializer {{{2
		initialize : function (character, streamer) {
			var start = streamer.get_cursor(), end, _class;

			this.type       = this.type;
			this.attrs      = [];
			this.events     = [];
			this.class_list = [];

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

		// Identifier {{{2
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

		// Content {{{2
		parse_content : function (streamer) {
			var character = streamer.next();
			if (character === '"' || character === "'") {
				this.content = this.parse_value(streamer);
				streamer.next(true);
			}
		},

		// Value {{{2
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

		// Attrs {{{2
		parse_attrs : function (streamer) {
			var character = streamer.next(true), attr, event;

			while (character && character !== ']') {
				if (character === '(') {
					streamer.next(true);
					event = { name : this.parse_identifier(streamer) };
					character = streamer.next(true);

					if (character !== ')') {
						throw new SyntaxError("[JeefoTemplate]: Invalid syntax error.");
					}

					character = streamer.next(true);
					if (character === '=') {
						streamer.next(true);
						event.handler = this.parse_value(streamer);
						character = streamer.next(true);
					} else {
						throw new SyntaxError("[JeefoTemplate]: Invalid syntax error, empty event.");
					}

					this.events.push(event);
				} else {
					attr = { key : dash_case(this.parse_identifier(streamer)) };

					character = streamer.next(true);

					if (character === '=') {
						streamer.next(true);
						attr.value = this.parse_value(streamer);
						character = streamer.next(true);
					}

					this.attrs.push(attr);
				}

				while (character === ',') {
					character = streamer.next(true);
				}
			}
		},
		// }}}2
	},
});
// }}}1

module.exports = tokenizer;
