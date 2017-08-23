/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : class_list.js
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

var array_remove = require("jeefo_utils/array/remove");

var ClassList = function (list) {
	this.list = [];

	if (list) {
		var i = list.length;
		while (i--) {
			this.list[i] = list[i];
		}
	}
};

ClassList.prototype = {
	add : function () {
		for (var i = 0; i < arguments.length; ++i) {
			if (this.list.indexOf(arguments[i]) === -1) {
				this.list.push(arguments[i]);
			}
		}
	},
	remove : function () {
		var i = arguments.length;
		while (i--) {
			array_remove(this.list, arguments[i]);
		}
	},
	contains : function (name) {
		return this.list.indexOf(name) !== -1;
	},
};

module.exports = ClassList;
