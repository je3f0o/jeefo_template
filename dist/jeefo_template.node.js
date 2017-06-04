
"use strict";

module.exports = function (jeefo) {

/**
 * jeefo_template : v0.0.9
 * Author         : je3f0o, <je3f0o@gmail.com>
 * Homepage       : https://github.com/je3f0o/jeefo_template
 * License        : The MIT License
 * Copyright      : 2017
 **/
jeefo.use(function (jeefo) {

/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jt_tokenizer.js
* Created at  : 2017-04-10
* Updated at  : 2017-06-03
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/


var jt = jeefo.module("jeefo_template", ["jeefo_tokenizer"]);

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

/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jt_compiler.js
* Created at  : 2017-04-10
* Updated at  : 2017-06-03
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/


// Attributes {{{1
jt.namespace("jeefo_template.attrs", [
	"is_array",
	"object.keys",
	"transform.dash_case",
], function (is_array, object_keys, dash_case) {
	var NodeElementAttributes = function () {},
		p = NodeElementAttributes.prototype;
	
	p.is_array           = is_array;
	p.dash_case          = dash_case;
	p.object_keys        = object_keys;
	p.NEW_LINE_REGEX     = /\n/g;
	p.SINGLE_QUOTE_REGEX = /'/g;

	// Stringify {{{2
	p.stringify = function (object) {
		var result = '', keys = this.object_keys(object), i = 0, len = keys.length;

		for (; i < len; ++i) {
			if (object[keys[i]] === void 0 || typeof object[keys[i]] === "function") {
				continue;
			}

			if (i > 0) {
				result += ", ";
			}
			switch (typeof object[keys[i]]) {
				case "string":
					result += "'" + keys[i] + "':'" + object[keys[i]].replace(this.SINGLE_QUOTE_REGEX, "\\'") + "'";
					break;
				case "object":
					if (object[keys[i]] === null) {
						result += "'" + keys[i] + "':null";
					} else if (object[keys[i]].toString) {
						if (object[keys[i]].toString() === "[object Object]") {
							result += "'" + keys[i] + "':" + this.stringify(object[keys[i]]);
						} else {
							result += "'" + keys[i] + "':'" + object[keys[i]].toString() + "'";
						}
					}
					break;
				case "number":
				case "boolean":
					result += "'" + keys[i] + "':" + object[keys[i]].toString();
					break;
			}
		}

		return "{ " + result + " }";
	};

	p.get_value = function (value) {
		return value.trim().replace(this.NEW_LINE_REGEX, ' ');
	};

	// Compile {{{2
	p.compile = function (attrs) {
		if (! attrs) { return ''; }

		var result = '', i = 0, len, keys;

		if (attrs.hasOwnProperty("id")) {
			result += ' id="' + this.get_value(attrs.id) + '"';
			delete attrs.id;
		}

		if (attrs.hasOwnProperty("_class")) {
			if (is_array(attrs._class)) {
				attrs._class = attrs._class.join(' ');
			}

			if (attrs.hasOwnProperty("class")) {
				attrs["class"] = attrs._class + ' ' + attrs["class"];
			} else {
				attrs["class"] = attrs._class;
			}

			delete attrs._class;
		}

		if (attrs.hasOwnProperty("class")) {
			result += ' class="' + this.get_value(attrs["class"]) + '"';
			delete attrs['class'];
		}

		for (keys = object_keys(attrs), len = keys.length; i < len; ++i) {
			switch (typeof attrs[keys[i]]) {
				case "object":
					if (attrs[keys[i]] === null) {
						result += ' ' + this.dash_case(keys[i]);
					} else {
						result += ' ' + this.dash_case(keys[i]) + '="' + this.stringify(attrs[keys[i]]) + '"';
					}
					break;
				case "string":
					result += ' ' + this.dash_case(keys[i]) + '="' + this.get_value(attrs[keys[i]]) + '"';
					break;
				case "undefined":
					result += ' ' + this.dash_case(keys[i]);
					break;
				default:
					result += ' ' + this.dash_case(keys[i]) + '="' + attrs[keys[i]].toString() + '"';
			}
		}

		return result;
	};
	// }}}2

	return new NodeElementAttributes();
});

// Compilter {{{1
jt.namespace("jeefo_template.compiler", [
	"is_array",
	"transform.dash_case",
	"jeefo_template.attrs",
	"jeefo_template.tokenizer"
], function (is_array, dash_case, attrs_compiler, tokenizer) {

	var JeefoTemplateCompiler = function () {};

	// Prototypes {{{2
	JeefoTemplateCompiler.prototype = {
		// Misc {{{3
		is_array    : is_array,
		dash_case   : dash_case,
		SPACE_REGEX : /\s+/,

		// Node Element {{{3
		NodeElement : function (token, parent) {
			this.name     = token.name ? dash_case(token.name) : "div";
			this.parent   = parent;
			this.children = [];

			if (token.attrs)   { this.attrs = token.attrs; }
			if (token.content) { this.content = token.content; }

			if (token.id) {
				if (this.attrs) {
					if (! this.attrs.id) { this.attrs.id = token.id; }
				} else {
					this.attrs = { id : this.id };
				}
			}

			if (token.class_list && token.class_list.length) {
				if (this.attrs) {
					if (this.attrs._class) {
						var class_list;
						if (this.is_array(this.attrs._class)) {
							class_list = this.attrs._class;
						} else {
							class_list = this.attrs._class.split(this.SPACE_REGEX);
						}

						for (var i = class_list.length - 1; i >= 0; --i) {
							if (class_list[i] && token.class_list.indexOf(class_list[i]) === -1) {
								token.class_list.push(class_list[i]);
							}
						}
					}

					this.attrs._class = token.class_list;
				} else {
					this.attrs = { _class : token.class_list };
				}
			}
		},

		// Self closed tags {{{3
		SELF_CLOSED_TAGS : ["img", "input", "hr", "br", "col"],

		// Make nodes {{{3
		make_nodes : function (tokenizer) {
			var NodeElement    = this.NodeElement,
				root           = new NodeElement({}),
				token          = tokenizer.next(),
				parent_element = root, node, last_token;

			for (; token; token = tokenizer.next()) {
				switch (token.type) {
					case "Element":
						node = new NodeElement(token, parent_element);
						parent_element.children[parent_element.children.length] = node;
						break;
					case "Operator":
						switch (token.operator) {
							case '+' :
								if (last_token.operator === '>') {
									node = new NodeElement({}, parent_element);
									parent_element.children[parent_element.children.length] = node;
								}

								switch (last_token.operator) { case '+' : case '>' :
									node = new NodeElement({}, parent_element);
									parent_element.children[parent_element.children.length] = node;
									token.compiled = true;
								}
								break;
							case '>' :
								switch (last_token.operator) {
									case '+' :
									case '>' :
										node = new NodeElement({}, parent_element);
										parent_element.children[parent_element.children.length] = node;
										parent_element = node;
										break;
									default:
										parent_element = parent_element.children[parent_element.children.length - 1];
								}
								break;
							case '^' :
								if (last_token.operator === '>') {
									node = new NodeElement({}, parent_element);
									parent_element.children[parent_element.children.length] = node;
								}

								if (parent_element.parent) {
									parent_element = parent_element.parent;
								} else {
									throw new Error("No parent element");
								}
								break;
							default:
								console.log("Invalid Operator");
								throw token;
						}
						break;
					case "Comment": // Do nothing
						break;
				}

				last_token = token;
			}

			switch (last_token.operator) { case '+': case '>':
				if (! last_token.compiled) {
					node = new NodeElement({}, parent_element);
					parent_element.children[parent_element.children.length] = node;
				}
			}

			return root.children;
		},

		// Compile beauty {{{3
		compile_beauty : function (nodes, indent, indentation) {
			var i = 0, len = nodes.length, result = '',
				SELF_CLOSED_TAGS = this.SELF_CLOSED_TAGS;

			for (; i < len; ++i) {
				if (i > 0) {
					result += '\n';
				}

				if (SELF_CLOSED_TAGS.indexOf(nodes[i].name) > -1) {
					result += indent + '<' + nodes[i].name + attrs_compiler.compile(nodes[i].attrs) + '>';
				} else {
					if (nodes[i].children.length) {

						result += indent + '<' + nodes[i].name + attrs_compiler.compile(nodes[i].attrs) + ">\n" +
							this.compile_beauty(nodes[i].children, indent + indentation, indentation) +
						'\n' + indent + "</" + nodes[i].name + '>';

					} else if (nodes[i].content) {

						result += indent + '<' + nodes[i].name + attrs_compiler.compile(nodes[i].attrs) + '>' +
							nodes[i].content +
						"</" + nodes[i].name + '>';

					} else {
						result += indent + '<' + nodes[i].name + attrs_compiler.compile(nodes[i].attrs) + "></" + nodes[i].name + '>';
					}
				}
			}

			return result;
		},

		// Compile ugly {{{3
		compile_ugly : function (nodes) {
			var i = 0, len = nodes.length, result = '',
				SELF_CLOSED_TAGS = this.SELF_CLOSED_TAGS;

			for (; i < len; ++i) {
				if (SELF_CLOSED_TAGS.indexOf(nodes[i].name) > -1) {

					result += '<' + nodes[i].name + attrs_compiler.compile(nodes[i].attrs) + '>';

				} else {
					if (nodes[i].children.length) {

						result += '<' + nodes[i].name + attrs_compiler.compile(nodes[i].attrs) + '>' +
							this.compile_ugly(nodes[i].children) +
						"</" + nodes[i].name + '>';

					} else if (nodes[i].content) {

						result += '<' + nodes[i].name + attrs_compiler.compile(nodes[i].attrs) + '>' +
							nodes[i].content +
						"</" + nodes[i].name + '>';

					} else {
						result += '<' + nodes[i].name + attrs_compiler.compile(nodes[i].attrs) + "></" + nodes[i].name + '>';
					}
				}
			}

			return result;
		},
		// }}}3
	};
	// }}}2

	var compiler = new JeefoTemplateCompiler();

	return function (source, is_beautify, tab_space, indent_type) {
		tokenizer.init(source, tab_space);
		var nodes = compiler.make_nodes(tokenizer);

		if (is_beautify) {
			tab_space   = tab_space || 4;
			indent_type = (indent_type === "tab") ? '\n' : ' ';

			for (var i = 0, indentation = ''; i < tab_space; ++i) {
				indentation += indent_type;
			}

			return compiler.compile_beauty(nodes, '', indentation);
		}

		return compiler.compile_ugly(nodes);
	};
});
// }}}1

});

return jeefo

};