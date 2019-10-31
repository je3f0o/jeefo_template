/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : test.js
* Created at  : 2019-06-22
* Updated at  : 2019-10-31
* Author      : jeefo
* Purpose     :
* Description :
* Reference   :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const parser = require("./src/parser");

const nodes = parser(`
{ jt }
.md-sidenav-wrapper >
    jfContent[select     =       "md-sidenav"     ] ^
.md-sidenav-content >
    something[a="b"] +
    jfContent >
        h1(Hello)
`);

console.log(nodes);
console.log(nodes[1].children);
