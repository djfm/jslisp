import {just, nothing} from '../parse-result';
import {string} from '../position-aware-string';
import node from '../ast-node';

function isTokenChar (char) {
    return !!/^[^\s()]$/.exec(char);
}

export default function tokenParser (str) {
    str = string(str);

    let token = '', i = 0;
    for (let len = str.length; i < len; ++i) {
        const c = str.charAt(i);
        if (isTokenChar(c)) {
            token += c;
            if (token === '\'') {
                ++i;
                break;
            }
        } else {
            break;
        }
    }
    if (token.length > 0) {
        let value = token;
        let kind  = "identifier";

        if (value === 'true') {
            value = true;
            kind  = "literal";
        } else if (/^\d+(?:\.\d+)?$/.exec(value)) {
            value = +value;
            kind  = "literal";
        }

        return just(node(value, kind, []), str.rest(i));
    } else {
        return nothing("String starts with a non-token char.", str, 0);
    }
}
