/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : class_list.js
* Created at  : 2017-08-14
* Updated at  : 2017-08-28
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var array_remove = require("jeefo_utils/array/remove");

var ClassList = function () {
	this.list = [];
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
	clone : function () {
		var class_list = new ClassList(), list = this.list, i = list.length;

		while (i--) {
			class_list.list[i] = list[i];
		}

		return class_list;
	}
};

module.exports = ClassList;
