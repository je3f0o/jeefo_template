#!/usr/bin/env node
/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : jt.js
* Created at  : 2022-02-09
* Updated at  : 2022-09-01
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

const fs = require("@jeefo/fs");
const jt = require("../");

const {argv, stdin} = process;

const compile = async (input, indent, output_filepath) => {
  const output = jt.compile(input, indent);
  if (output_filepath) {
    await fs.writeFile(output_filepath, output);
  } else {
    console.log(output);
  }
};

(async () => {
  let input  = '';
  let indent = '';
  let output;

  for (let i = 2; i < argv.length; ++i) {
    switch (argv[i]) {
      case "-i" :
      case "--input" :
        i += 1;
        if (i === argv.length) {
          throw new Error("Invalid argument");
        } else {
          input = await fs.readFile(argv[i], "utf8");
        }
        break;
      case "-o" :
      case "--output" :
        i += 1;
        output = argv[i];
        break;
      case "--indent" :
        i += 1;
        indent = argv[i];
        break;
      case "--indent-space" :
        i += 1;
        indent = ' '.repeat(+argv[i]);
        break;
      case "--indent-tab" :
        indent = '\t';
        break;
    }
  }

  if (input) {
    compile(input, indent, output);
  } else {
    stdin.resume();
    stdin.setEncoding("utf8");

    stdin.on("data", chunk => {
      input += chunk;
    });

    stdin.on("end", () => compile(input, indent, output));
  }
})();