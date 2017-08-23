/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : attributes.js
* Created at  : 2017-08-14
* Updated at  : 2017-08-21
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var dash_case          = require("jeefo_utils/string/dash_case"),
	object_keys        = Object.keys,
	array_remove       = require("jeefo_utils/array/remove"),
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

var Attributes = function (attrs) {
	this.keys   = [];
	this.values = {};

	if (attrs) {
		for (var i = 0; i < attrs.length; ++i) {
			this.set(attrs[i].key, attrs[i].value);
		}
	}
};

Attributes.prototype = {
	get : function (key) {
		return this.values[dash_case(key)];
	},
	set : function (key, value) {
		if (this.keys.indexOf(key) === -1) {
			this.keys.push(key);
		}
		this.values[key] = value;
	},
	remove : function (key) {
		array_remove(this.keys, key);
	},
	has : function (key) {
		return this.keys.indexOf(key) !== -1;
	},
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
	compile : function () {
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
};

module.exports = Attributes;
