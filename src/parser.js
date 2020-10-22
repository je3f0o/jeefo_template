/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : parser.js
* Created at  : 2017-08-12
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

const tokenizer   = require("./tokenizer");
const NodeElement = require("./node_element");

module.exports = function (code, tab_space) {
	tokenizer.init(code, tab_space);

	const result = [];

	let token          = tokenizer.get_next_token();
	let parent_element = null;
    let expect_element = true;
    let node, last_token;

	while (token) {
		switch (token.id) {
			case "Element":
                if (expect_element) {
                    node = new NodeElement(token, parent_element);
                    if (parent_element) {
                        parent_element.add_child(node);
                    } else {
                        result.push(node);
                    }
                    expect_element = false;
                } else {
                    const str = tokenizer.streamer.substring_from_token(token);
                    throw new Error(`Unexpected element: ${str}`);
                }
				break;
			case "Operator":
				switch (token.operator) {
					case '^' :
                        if (parent_element) {
                            parent_element = parent_element.parent;
                        } else {
                            throw new Error("Expected operator");
                        }
						break;
					case '+' :
                        if (expect_element) {
                            throw new Error("Unexpected operator");
                        }
						break;
					case '>' :
                        if (expect_element) {
                            throw new Error("Unexpected operator");
                        }
                        const arr = parent_element
                            ? parent_element.children : result;
                        parent_element = arr[arr.length - 1];
                        if (parent_element.content) {
                            throw new Error("Ambiguous children");
                        }
						break;
					default:
						throw new Error("Invalid Operator");
				}
                expect_element = true;
				break;
		}

		last_token = token;
        token      = tokenizer.get_next_token();
	}

	return result;
};
