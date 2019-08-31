/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : attributes.js
* Created at  : 2017-08-14
* Updated at  : 2019-07-11
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

const array_remove = require("@jeefo/utils/array/remove");

class Attributes {
    constructor () {
        this.names  = [];
        this.values = {};
    }

    has (name) {
        return this.names.includes(name);
    }

    get (name) {
        return this.values[name];
    }

    set (name, value) {
        if (! this.names.includes(name)) {
            this.names.push(name);
        }
        this.values[name] = value;
    }

    remove (name) {
        array_remove(this.names, name);
    }

    each (callback) {
        const { names, values } = this;
        for (let i = 0; i < names.length; ++i) {
            callback(names[i], values[names[i]]);
        }
    }

    filter (callback) {
        const { names, values } = this;
        for (let i = 0; i < names.length; ++i) {
            if (! callback(names[i], values[names[i]])) {
                names.splice(i, 1);
                i -= 1;
            }
        }
    }

    find (callback) {
        const { names, values } = this;
        for (let i = 0; i < names.length; ++i) {
            if (callback(names[i], values[names[i]])) {
                return names[i];
            }
        }
    }

    clone () {
        const clone = new Attributes();
        this.names.forEach(name => {
            clone.names.push(name);
            clone.values[name] = this.values[name];
        });
        return clone;
    }
}

module.exports = Attributes;
