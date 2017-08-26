/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : tokenizer.js
* Created at  : 2017-04-10
* Updated at  : 2017-08-26
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* global */
/* exported */

// ignore:end

var Tokenizer = require("jeefo_tokenizer"),
	tokenizer = new Tokenizer();

tokenizer.
	register(require("./tokens/comment.js")).
	register(require("./tokens/element.js")).
	register(require("./tokens/operator.js"));

module.exports = tokenizer;
