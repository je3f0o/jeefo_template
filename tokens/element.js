/* -.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.-.
* File Name   : element.js
* Created at  : 2017-08-26
* Updated at  : 2019-07-09
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
const special_characters = ".#[(+>^";

const WHITESPACE_REGEX = /\s+/;

function parse_content (streamer) {
	const start_index = streamer.cursor.position.index + 1;

	let character = streamer.next();
	while (character && character !== ')') {
        character = streamer.next();
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
    streamer.cursor.move(length - 1);

	return streamer.substring_from_offset(start_index);
}

function add_class (class_list, classes) {
    classes.split(WHITESPACE_REGEX).filter(c => c).forEach(class_name => {
        if (! class_list.includes(class_name)) {
            class_list.push(class_name);
        }
    });
}

function parse_attrs (streamer, attrs, events, class_list) {
	let character = streamer.next(true), value;

	while (character && character !== ']') {
		if (character === '(') {
			streamer.next(true);
			const key = parse_identifier(streamer);
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

			events[key] = value;
		} else {
			const key = dash_case(parse_identifier(streamer));
			character = streamer.next(true);

			if (character === '=') {
			    streamer.next(true);
				value     = parse_value(streamer);
                character = streamer.next(true);
			} else if (key === "class") {
				throw new SyntaxError("[JeefoTemplate]: Missing class value.");
			} else {
                value = undefined;
            }

			if (key === "class") {
                add_class(class_list, value);
			} else {
                attrs.set(key, value);
			}
		}

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
        const events     = Object.create(null);
        const class_list = [];

        let id      = null;
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
                    if (streamer.cursor.has_saved_position()) {
                        streamer.cursor.commit();
                    }
                    streamer.next(true);
                    const class_name = parse_identifier(streamer);
                    if (! class_name) {
                        throw new SyntaxError("Invalid class");
                    }
                    if (! class_list.includes(class_name)) {
                        class_list.push(class_name);
                    }

                    streamer.cursor.save();
                    current_character = streamer.next(true);
                    break;
                case '#' :
                    if (streamer.cursor.has_saved_position()) {
                        streamer.cursor.commit();
                    }
                    streamer.next(true);
                    id = parse_identifier(streamer);
                    if (! id) {
                        throw new SyntaxError("Invalid id");
                    }

                    streamer.cursor.save();
                    current_character = streamer.next(true);
                    break;
                default:
                    break LOOP;
            }
        }

        if (current_character === '[') {
            if (streamer.cursor.has_saved_position()) {
                streamer.cursor.commit();
            }
            parse_attrs(streamer, attrs, events, class_list);

            streamer.cursor.save();
            current_character = streamer.next(true);
        }

        if (current_character && current_character === '(') {
            streamer.cursor.commit();
            content = parse_content(streamer);
        } else if (streamer.cursor.has_saved_position()) {
            streamer.cursor.rollback();
        }

        token._id        = id;
        token.name       = name;
        token.attrs      = attrs;
        token.events     = events;
        token.class_list = class_list;
        token.content    = content;
        token.start      = start;
        token.end        = streamer.clone_cursor_position();
    }
};
