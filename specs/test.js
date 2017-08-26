/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : test.js
* Created at  : 2017-08-21
* Updated at  : 2017-08-26
* Author      : jeefo
* Purpose     :
* Description :
_._._._._._._._._._._._._._._._._._._._._.*/
// ignore:start

/* globals */
/* exported */

// ignore:end

var fs   = require("fs"),
	jt   = require("../index"),
	path = require("path");

var p = path.join(__dirname, "./test.jt");

var source = fs.readFileSync(p, "utf8");

var is_beauty = process.argv[2] === "true";

var result = jt(source, is_beauty);

console.log(result);

/* Debug {{{1
if (require.main === module) {
var compile = module.exports;

var fs     = require("fs");
var source = fs.readFileSync("./test.jt", "utf8");
var highlight = require("pygments").colorize;
var attrs_compiler = require("./attrs_compiler");

var attrs = attrs_compiler({
	attr : {
		foo : "bar",
		number : 123,
		'null' : null,
		fff : undefined,
		bool : true,
		date : new Date(),
		f : function () {}
	}
});
//console.log(attrs);

var error_handler = function (error, offset) {
	console.error(error.message);
	console.error(`Value: ${ error.token }`);
	console.error(`Line number: ${ error.lineNumber + (offset || 0) }`);
	console.error(`Column number: ${ error.columnNumber }`);
	console.error(error.stack);
	process.exit();
};

try {
	//var single_line    = source.split('\n')[2];
	//var single_line = source.split('\n').splice(2, 14).join('\n');

	// Uglify
	//highlight(compile(single_line), "html", 'console', console.log);

	// Indent 2 space
	//highlight(compile(single_line, true, 2), "html", 'console', console.log);

	// Indent default
	//highlight(compile(single_line, true), "html", 'console', console.log);

	console.log(compile(source, true));
	return;
	// Stupid endings
	var stupid_endings = source.split('\n')[5];
	highlight(compile(stupid_endings, true), "html", 'console', console.log);

	// Full source code
	highlight(compile(source, true), "html", 'console', console.log);
} catch (e) {
	error_handler(e);
}

}
}}}1 */
