/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : events.js
* Created at  : 2019-09-14
* Updated at  : 2019-09-14
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

class Events {
    constructor () {
        this.names  = [];
        this.values = {};
    }

    get length () {
        return this.names.length;
    }

    add (name, value) {
        this.names.push(name);
        this.values[name] = value;
    }

    * [Symbol.iterator] () {
        const { names, values } = this;
        for (let name of names) {
            yield [name, values[name]];
        }
    }

    clone () {
        const clone = new Events();
        this.names.forEach(name => {
            clone.names.push(name);
            clone.values[name] = this.values[name];
        });
        return clone;
    }
}

module.exports = Events;
