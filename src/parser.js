/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-08-12
* Updated at  : 2019-07-06
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const tokenizer   = require("./tokenizer");
const NodeElement = require("./node_element");

module.exports = function (code, tab_space) {
	tokenizer.init(code, tab_space);

	const root = new NodeElement(null, {});

	let token          = tokenizer.get_next_token();
	let parent_element = root;
    let node, last_token;

	while (token) {
		switch (token.id) {
			case "Element":
				node = new NodeElement(token._id, token, parent_element);
                parent_element.add_child(node);
				break;
			case "Operator":
				switch (token.operator) {
					case '+' :
						if (last_token.operator === '>') {
							node = new NodeElement(null, {}, parent_element);
                            parent_element.add_child(node);
						}

						switch (last_token.operator) { case '+' : case '>' :
							node = new NodeElement(null, {}, parent_element);
                            parent_element.add_child(node);
						}
						break;
					case '>' :
						switch (last_token.operator) {
							case '+' :
							case '>' :
								node = new NodeElement(null, {}, parent_element);
								parent_element.add_child(node);
								parent_element = node;
								break;
							default:
								parent_element = parent_element.last_child();
						}
						break;
					case '^' :
						if (last_token.operator === '>') {
							node = new NodeElement(null, {}, parent_element);
                            parent_element.add_child(node);
						}

						if (parent_element.parent) {
							parent_element = parent_element.parent;
						} else {
							throw new Error("No parent element");
						}
						break;
					default:
						throw new Error("Invalid Operator");
				}
				break;
		}

		last_token = token;
        token      = tokenizer.get_next_token();
	}

    /*
	switch (last_token.operator) { case '+': case '>':
		if (! last_token.compiled) {
			node = new NodeElement({}, parent_element);
			parent_element.children[parent_element.children.length] = node;
		}
	}
    */

	return root.children;
};
