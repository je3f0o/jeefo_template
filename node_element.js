/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : node_element.js
* Created at  : 2017-08-11
* Updated at  : 2017-08-21
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var dash_case        = require("jeefo_utils/string/dash_case"),
	ClassList        = require("./class_list"),
	Attributes       = require("./attributes"),
	SELF_CLOSED_TAGS = ["img", "input", "hr", "br", "col"];

var NodeElement = function (token, parent) {
	this.id         = token.id || null;
	this.name       = token.name ? dash_case(token.name) : "div";
	this.attrs      = new Attributes(token.attrs);
	this.events     = token.events;
	this.parent     = parent || null;
	this.content    = token.content || null;
	this.children   = [];
	this.class_list = new ClassList(token.class_list);
};

NodeElement.prototype = {
	clear : function () {
		this.id              = null;
		this.name            = "div";
		this.events          = [];
		this.content         = null;
		this.children        = [];
		this.attrs.keys      = [];
		this.class_list.list = [];
	},
	clone : function () {
		var node = new NodeElement({
			id         : this.id,
			name       : this.name,
			attrs      : null,
			events     : this.events,
			content    : this.content,
			children   : this.children,
			class_list : this.class_list.list
		}, this.parent);

		node.attrs = this.attrs.clone();

		return node;
	},
	compile : function (indent, indentation) {
		var attrs = this.attrs.compile(), line_break = indentation ? '\n' : '', content;

		if (this.class_list.list.length) {
			attrs = ` class="${ this.class_list.list.join(' ') }"${ attrs }`;
		}
		if (this.id) {
			attrs = ` id="${ this.id }"${ attrs }`;
		}
		if (this.component_id) {
			attrs = `${ attrs } jeefo-component-id="${ this.component_id }"`;
		}

		if (SELF_CLOSED_TAGS.indexOf(this.name) > -1) {
			return `<${ this.name }${ attrs }>`;
		}

		if (this.content) {
			content = this.content;
		} else {
			var i = this.children.length, child_indent = `${ indent }${ indentation }`;
			content = '';

			while (i--) {
				content = `${ line_break }${ child_indent }${ this.children[i].compile(child_indent, indentation) }${ content }`;
			}

			if (content) {
				content += `${ line_break }${ indent }`;
			}
		}

		return `<${ this.name }${ attrs }>${ content }</${ this.name }>`;
	},
};

module.exports = NodeElement;
