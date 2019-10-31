/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : attributes.js
* Created at  : 2017-08-14
* Updated at  : 2019-06-22
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const dash_case    = require("./utils/dash_case");
//const array_remove = require("./utils/array_remove");

var object_keys        = Object.keys,
	NEW_LINE_REGEX     = /\n/g,
	SINGLE_QUOTE_REGEX = /'/g;

var get_value = function (value) {
	return value.trim().replace(NEW_LINE_REGEX, ' ');
};

var stringify = function (object) {
	var result = '', keys = object_keys(object), i = 0, len = keys.length;

	for (; i < len; ++i) {
		if (object[keys[i]] === void 0 || typeof object[keys[i]] === "function") {
			continue;
		}

		if (i > 0) {
			result += ", ";
		}
		switch (typeof object[keys[i]]) {
			case "string":
				result += `'${ keys[i] }':'${ object[keys[i]].replace(SINGLE_QUOTE_REGEX, "\\'") }'`;
				break;
			case "object":
				if (object[keys[i]] === null) {
					result += `'${ keys[i] }':null`;
				} else if (object[keys[i]].toString) {
					if (object[keys[i]].toString() === "[object Object]") {
						result += `'${ keys[i] }':${ stringify(object[keys[i]]) }`;
					} else {
						result += `'${ keys[i] }':'${ object[keys[i]].toString() }'`;
					}
				}
				break;
			case "number":
			case "boolean":
				result += `'${ keys[i] }':${ object[keys[i]].toString() }`;
				break;
		}
	}

	return `{ ${ result } }`;
};

class Attributes {
    constructor () {
        this.values = Object.create(null);
    }

	get (key) {
		return this.values[dash_case(key)];
	}
	set (key, value) {
		if (this.keys.indexOf(key) === -1) {
			this.keys.push(key);
		}
		this.values[key] = value;
	}
	has (key) {
		return this.keys.indexOf(key) !== -1;
	}
	remove (key) {
	}
    /*
	clone : function () {
		var attrs  = new Attributes(),
			keys   = this.keys,   _keys   = attrs.keys,
			values = this.values, _values = attrs.values,
			i = keys.length;

		while (i--) {
			_keys[i]         = keys[i];
			_values[keys[i]] = values[keys[i]];
		}

		return attrs;
	},
	compile () {
		var result = '', keys = this.keys, i = keys.length, value;

		while (i--) {
			value = this.values[keys[i]];

			switch (typeof value) {
				case "object":
					if (value === null) {
						result = ` ${ keys[i] }${ result }`;
					} else {
						result = ` ${ keys[i] }="${ stringify(value) }"${ result }`;
					}
					break;
				case "string":
					result = ` ${ keys[i] }="${ get_value(value) }"${ result }`;
					break;
				case "undefined":
					result = ` ${ keys[i] }`;
					break;
				default:
					result = ` ${ keys[i] }="${ value.toString() }"${ result }`;
			}
		}

		return result;
	}
    */
}

module.exports = Attributes;
