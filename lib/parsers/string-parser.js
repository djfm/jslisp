import {just, nothing} from '../parse-result';
import {string} from '../position-aware-string';

export default function stringParser (str) {
    str = string(str);

    const quote  = '"';
    const escape = '\\';

    let state   = null;
    let parsedString  = '';

    let pos = 0;
    for (let len = str.length; pos < len; ++pos) {
        const c = str.charAt(pos);

        if (null === state) {
            if (quote === c) {
                state = 'in string';
            } else {
                return nothing("Doesn't start with a quote char.", str, 0);
            }
        } else if ('in string' === state) {
            if (quote === c) {
                return just(parsedString, str.rest(pos + 1));
            } else if (escape === c) {
                state = 'in escape';
            } else {
                parsedString += c;
            }
        } else if ('in escape' === state) {
            if (quote === c) {
                parsedString += quote;
            } else {
                parsedString += escape + c;
            }
            state = 'in string';
        }
    }

    return nothing('Unterminated string.', str, pos - 1);
}
