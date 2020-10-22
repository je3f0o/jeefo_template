/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : element.js
* Created at  : 2017-08-26
* Updated at  : 2020-10-22
* Author      : jeefo
* Purpose     :
* Description :
.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.*/
// ignore:start
"use strict";

/* globals*/
/* exported*/

// ignore:end

const dash_case  = require("@jeefo/utils/string/dash_case");
const Attributes = require("./attributes");

const delimiters         = ".,>+^[]()=\"'#{}";
const special_characters = ".#[(";

const WHITESPACE_REGEX = /\s+/;

function parse_content (streamer) {
	const start_index = streamer.cursor.position.index + 1;

    let character = streamer.next();
	while (character && character !== ')') {
		if (character === '\\') {
            streamer.cursor.move_next();
		}
        character = streamer.next(true);
	}

    const end_index = streamer.cursor.position.index;
	return streamer.string.substring(start_index, end_index);
}

function parse_value (streamer) {
	const quote       = streamer.get_current_character();
	const start_index = streamer.cursor.position.index;

    let character = streamer.get_next_character();
    while (character && character !== quote) {
		if (character === '\\') {
            streamer.cursor.move_next();
		}
        character = streamer.next(true);
	}

    const end_index = streamer.cursor.position.index;
	return streamer.string.substring(start_index + 1, end_index);
}

function parse_identifier (streamer) {
	const start_index = streamer.cursor.position.index;

    let ch = streamer.get_current_character(), length = 0;
	while (ch && ch > ' ' && ! delimiters.includes(ch)) {
        length += 1;
        ch = streamer.at(start_index + length);
	}
    if (length) {
        streamer.cursor.move(length - 1);
    }

	return streamer.substring_from_offset(start_index);
}

function parse_attrs (streamer, attrs) {
	let character = streamer.next(true), key, value;

	while (character && character !== ']') {
		if (character === '(') {
			streamer.next(true);
			key = parse_identifier(streamer);
			character = streamer.next(true);

			if (character !== ')') {
				throw new SyntaxError("[JeefoTemplate]: Invalid event");
			}

			if (streamer.next(true) === '=') {
				streamer.next(true);
				value     = parse_value(streamer);
                character = streamer.next(true);
			} else {
				throw new SyntaxError("[JeefoTemplate]: Empty event.");
			}

            key = `on--${key}`.toLowerCase();
		} else {
			key = dash_case(parse_identifier(streamer));
			character = streamer.next(true);

			if (character === '=') {
			    streamer.next(true);
				value     = parse_value(streamer);
                character = streamer.next(true);
			} else {
                value = null;
            }
		}

        if (attrs[key]) {
            throw new Error(`Duplicated attribute: ${key}`);
        }
        attrs[key] = value;
		while (character === ',') {
			character = streamer.next(true);
		}
	}
}

module.exports = {
    id       : "Element",
    priority : 0,

	is         : () => true,
    initialize : (token, current_character, streamer) => {
        const start      = streamer.clone_cursor_position();
        const attrs      = new Attributes();
        const class_list = new Set();

        let name    = null;
        let content = null;

        if (! special_characters.includes(current_character)) {
            name = dash_case(parse_identifier(streamer));
            streamer.cursor.save();
            current_character = streamer.next(true);
        }

        LOOP:
        while (true) {
            switch (current_character) {
                case '.' :
                    streamer.next();
                    const class_name = parse_identifier(streamer).trim();
                    if (!class_name) { throw new SyntaxError("Invalid class"); }
                    class_list.add(class_name);

                    if (streamer.cursor.has_saved_position()) {
                        streamer.cursor.commit();
                    }
                    streamer.cursor.save();
                    current_character = streamer.next(true);
                    break;
                case '#' :
                    if (attrs.id) { throw new SyntaxError("Invalid syntax"); }
                    streamer.next();
                    const id = parse_identifier(streamer).trim();
                    if (! id) { throw new SyntaxError("Invalid id"); }
                    attrs.id = id;

                    if (streamer.cursor.has_saved_position()) {
                        streamer.cursor.commit();
                    }
                    streamer.cursor.save();
                    current_character = streamer.next(true);
                    break;
                default:
                    break LOOP;
            }
        }

        if (current_character === '[') {
            parse_attrs(streamer, attrs);
            if (streamer.cursor.has_saved_position()) {
                streamer.cursor.commit();
            }
            streamer.cursor.save();
            current_character = streamer.next(true);
        }

        if (current_character === '(') {
            content = parse_content(streamer);
            streamer.cursor.commit();
        } else {
            streamer.cursor.rollback();
        }

        if (class_list.size) {
            attrs.class = [...class_list].concat(
                attrs.class ? attrs.class.split(WHITESPACE_REGEX) : []
            ).join(' ');
        }

        token.name    = name;
        token.attrs   = attrs;
        token.content = content;
        token.start   = start;
        token.end     = streamer.clone_cursor_position();
    }
};
