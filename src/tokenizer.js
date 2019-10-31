/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : tokenizer.js
* Created at  : 2017-04-10
* Updated at  : 2019-06-23
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const Tokenizer = require("@jeefo/tokenizer");
const tokenizer = new Tokenizer();

tokenizer.register(require("./tokens/comment"));
tokenizer.register(require("./tokens/element"));
tokenizer.register(require("./tokens/operator"));

module.exports = tokenizer;
