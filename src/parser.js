/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-08-12
* Updated at  : 2017-08-12
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var tokenizer   = require("./tokenizer"),
	NodeElement = require("./node_element");

module.exports = function (code, tab_space) {
	tokenizer.init(code, tab_space);

	var root           = new NodeElement({}),
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
};
