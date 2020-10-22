/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : node_element.js
* Created at  : 2017-08-11
* Updated at  : 2020-10-22
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

/*
const Attributes    = require("./tokens/attributes");
const object_assign = require("@jeefo/utils/object/assign");
*/

//const SELF_CLOSED_TAGS = ["img", "input", "hr", "br", "col"];

class NodeElement {
    constructor (token, parent = null) {
        this.name     = token.name || "div";
        this.attrs    = token.attrs;
        this.parent   = parent;
        this.content  = token.content;
        this.children = [];
    }

    add_child (node) {
        node.parent = this;
        this.children.push(node);
    }

    toString (indentation) {
        let attrs = this.attrs.toString();
        if (attrs) { attrs = ` ${attrs}`; }
        let content = '';

        if (this.content) {
            content = this.content;
        } else if (this.children.length) {
            if (indentation) {
                let deep = 1, p = this.parent;
                while (p) {
                    p = p.parent;
                    deep += 1;
                }
                const indent = indentation.repeat(deep);

                content = this.children.map(n => {
                    return n.toString(indentation);
                }).join(`\n${indent}`);

                content = `\n${indent}${content}\n${indentation.repeat(deep - 1)}`;
            } else {
                content = this.children.map(n => n.toString()).join('');
            }
        }

        return `<${this.name}${attrs}>${content}</${this.name}>`;
    }
}

module.exports = NodeElement;
