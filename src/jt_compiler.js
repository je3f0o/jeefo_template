/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jt_compiler.js
* Created at  : 2017-04-10
* Updated at  : 2017-06-03
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start
"use strict";

var jt = require("./jt_tokenizer");

/* global */
/* exported */

// ignore:end

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
					result += `'${ keys[i] }':'${ object[keys[i]].replace(this.SINGLE_QUOTE_REGEX, "\\'") }'`;
					break;
				case "object":
					if (object[keys[i]] === null) {
						result += `'${ keys[i] }':null`;
					} else if (object[keys[i]].toString) {
						if (object[keys[i]].toString() === "[object Object]") {
							result += `'${ keys[i] }':${ this.stringify(object[keys[i]]) }`;
						} else {
							result += `'${ keys[i] }':'${ object[keys[i]].toString() }'`;
						}
					}
					break;
				case "number":
				case "boolean":
					result += `'${ keys[i] }':${ object[keys[i]].toString() }`;
					break;
			}
		}

		return `{ ${ result } }`;
	};

	p.get_value = function (value) {
		return value.trim().replace(this.NEW_LINE_REGEX, ' ');
	};

	// Compile {{{2
	p.compile = function (attrs) {
		if (! attrs) { return ''; }

		var result = '', i = 0, len, keys;

		if (attrs.hasOwnProperty("id")) {
			result += ` id="${ this.get_value(attrs.id) }"`;
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
			result += ` class="${ this.get_value(attrs["class"]) }"`;
			delete attrs['class'];
		}

		for (keys = object_keys(attrs), len = keys.length; i < len; ++i) {
			switch (typeof attrs[keys[i]]) {
				case "object":
					if (attrs[keys[i]] === null) {
						result += ` ${ this.dash_case(keys[i]) }`;
					} else {
						result += ` ${ this.dash_case(keys[i]) }="${ this.stringify(attrs[keys[i]]) }"`;
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
					result += `${ indent }<${ nodes[i].name }${ attrs_compiler.compile(nodes[i].attrs) }>`;
				} else {
					if (nodes[i].children.length) {

						result += `${ indent }<${ nodes[i].name }${ attrs_compiler.compile(nodes[i].attrs) }>\n` +
							this.compile_beauty(nodes[i].children, indent + indentation, indentation) +
						`\n${ indent }</${ nodes[i].name }>`;

					} else if (nodes[i].content) {

						result += `${ indent }<${ nodes[i].name }${ attrs_compiler.compile(nodes[i].attrs) }>` +
							nodes[i].content +
						`</${ nodes[i].name }>`;

					} else {
						result += `${ indent }<${ nodes[i].name }${ attrs_compiler.compile(nodes[i].attrs) }></${ nodes[i].name }>`;
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

					result += `<${ nodes[i].name }${ attrs_compiler.compile(nodes[i].attrs) }>`;

				} else {
					if (nodes[i].children.length) {

						result += `<${ nodes[i].name }${ attrs_compiler.compile(nodes[i].attrs) }>` +
							this.compile_ugly(nodes[i].children) +
						`</${ nodes[i].name }>`;

					} else if (nodes[i].content) {

						result += `<${ nodes[i].name }${ attrs_compiler.compile(nodes[i].attrs) }>` +
							nodes[i].content +
						`</${ nodes[i].name }>`;

					} else {
						result += `<${ nodes[i].name }${ attrs_compiler.compile(nodes[i].attrs) }></${ nodes[i].name }>`;
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

// ignore:start
module.exports = jt;

if (require.main === module) {

var fs = require("fs");
var highlight = require("pygments").colorize;
var source = fs.readFileSync("./test.jt", "utf8");

jt.run("jeefo_template.attrs", function (attrs) {
	return;

	console.log(attrs.compile({
		attr : {
			foo : "bar",
			number : 123,
			'null' : null,
			fff : undefined,
			bool : true,
			date : new Date(),
			f : function () {}
		}
	}));

});

jt.run("jeefo_template.compiler", function (compile) {

var error_handler = function (error, offset) {
	console.error(error.message);
	console.error(`Value: ${ error.token }`);
	console.error(`Line number: ${ error.lineNumber + (offset || 0) }`);
	console.error(`Column number: ${ error.columnNumber }`);
	console.error(error.stack);
	process.exit();
};

try {
	//var single_line    = source.split('\n')[2];
	//var single_line = source.split('\n').splice(2, 14).join('\n');

	// Uglify
	//highlight(compile(single_line), "html", 'console', console.log);

	// Indent 2 space
	//highlight(compile(single_line, true, 2), "html", 'console', console.log);

	// Indent default
	//highlight(compile(single_line, true), "html", 'console', console.log);

	// Stupid endings
	var stupid_endings = source.split('\n')[5];
	highlight(compile(stupid_endings, true), "html", 'console', console.log);

	// Full source code
	highlight(compile(source, true), "html", 'console', console.log);
} catch (e) {
	error_handler(e);
}

});

}
// ignore:end
