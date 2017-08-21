/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : highlight.js
* Created at  : 2017-07-26
* Updated at  : 2017-07-26
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var jeefo = require("jeefo").create();
jeefo.use(require("jeefo_core"));
jeefo.use(require("jeefo_tokenizer"));
jeefo.use(require("./index.js"));

var jt = jeefo.module("jeefo.template");
var fs = require("fs");
var highlight = require("pygments").colorize;

var error_handler = function (error, offset) {
	console.error(error.message);
	console.error(`Value: ${ error.token }`);
	console.error(`Line number: ${ error.lineNumber + (offset || 0) }`);
	console.error(`Column number: ${ error.columnNumber }`);
	console.error(error.stack);
	process.exit();
};

jt.run(["jeefo_template.compiler"], function (compile) {
	try {
		var source = fs.readFileSync(process.argv[2], "utf8");
		highlight(compile(source, true), "html", 'console', console.log);
	} catch (e) {
		error_handler(e);
	}
});
