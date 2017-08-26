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

var tokens = [
	"comment",
	"element",
	"operator"
],
Tokenizer = require("jeefo_tokenizer"),
tokenizer = new Tokenizer();

tokens.forEach(function (token) {
	token = require(`./tokens/${ token }.js`);
	tokenizer.register(token);
});

module.exports = tokenizer;
