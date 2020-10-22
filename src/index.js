/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-08-09
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

exports.parse = require("./parser");

exports.compile = (source, indent) => {
    const nodes = exports.parse(source);
    return nodes.map(node => node.toString(indent)).join(indent ? '\n' : '');
};
