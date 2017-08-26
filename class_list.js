/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : class_list.js
* Created at  : 2017-08-14
* Updated at  : 2017-08-26
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
	add : function (class_name) {
		if (this.list.indexOf(class_name) === -1) {
			this.list.push(class_name);
		}
	},
	remove : function (class_name) {
		array_remove(this.list, class_name);
	},
	contains : function (name) {
		return this.list.indexOf(name) !== -1;
	},
};

module.exports = ClassList;
