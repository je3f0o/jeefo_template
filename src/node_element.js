/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : node_element.js
* Created at  : 2017-08-11
* Updated at  : 2019-07-18
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const object_assign = require("@jeefo/utils/object/assign");

//const SELF_CLOSED_TAGS = ["img", "input", "hr", "br", "col"];

class NodeElement {
    constructor (id, token, parent = null) {
        this.id         = id;
        this.name       = token.name || "div";
        this.attrs      = token.attrs;
        this.events     = token.events;
        this.parent     = parent;
        this.content    = token.content;
        this.children   = [];
        this.class_list = token.class_list;
    }

    add_child (node) {
        this.children.push(node);
    }

    last_child () {
        return this.children[this.children.length - 1];
    }

    //to_html () {}

    clone (is_deep) {
        const node = new NodeElement(this.id, {
            name       : this.name,
            content    : this.content,
            attrs      : this.attrs.clone(),
            events     : object_assign(this.events),
            class_list : this.class_list.concat(),
        }, this.parent);

        if (is_deep) {
            node.children = this.children.map(child => child.clone(true));
        } else {
            node.children = this.children;
        }

        return node;
    }
}

/*
NodeElement.prototype = {
	clear : function () {
		this.id         = null;
		this.name       = "div";
		this.attrs      = new Attributes();
		this.events     = new Events();
		this.parent     = null;
		this.content    = null;
		this.children   = [];
		this.class_list = new ClassList();
	},
	clone : function () {
		var node = new NodeElement({
			id         : this.id || null,
			name       : this.name,
			attrs      : this.attrs.clone(),
			events     : this.events.clone(),
			parent     : this.parent,
			content    : this.content || null,
			class_list : this.class_list.clone()
		}), i = this.children.length;

		while (i--) {
			node.children[i]        = this.children[i].clone();
			node.children[i].parent = node;
		}

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

		var name = this.name || "div";

		if (SELF_CLOSED_TAGS.indexOf(this.name) > -1) {
			return `<${ name }${ attrs }>`;
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

		return `<${ name }${ attrs }>${ content }</${ name }>`;
	},
};
*/

module.exports = NodeElement;
