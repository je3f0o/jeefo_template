/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : index.js
* Created at  : 2017-08-09
* Updated at  : 2019-06-25
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

exports.compile = nodes => {
    return nodes.map(node => {
        const attrs        = [];
        const element_name = node.name || "div";
        let content = '';

        if (node.id) {
            attrs.push(`id="${ node.id }"`);
        }
        if (node.class_list) {
            attrs.push(`class="${ node.class_list.join(' ') }"`);
        }
        Object.keys(node.attrs).forEach(key => {
            attrs.push(`${ key }="${ node.attrs[key] }"`);
        });

        return `<${ element_name }${ attrs }>${ content }</${ element_name }>`;
    }).join('');
};
