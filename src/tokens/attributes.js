/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : attributes.js
* Created at  : 2017-08-14
* Updated at  : 2020-10-22
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

class Attributes {
    get length () {
        return Object.keys(this).length;
    }

    toString () {
        return Object.keys(this).map(key => {
            return this[key] === null ? key : `${key}="${this[key]}"`;
        }).join(' ');
    }

    clone () {
        return Object.assign(new Attributes(), this);
    }
}

module.exports = Attributes;
