import {just, nothing} from '../parse-result';
import {string} from '../position-aware-string';

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
        } else {
            break;
        }
    }
    if (token.length > 0) {
        return just(token, str.rest(i));
    } else {
        return nothing("String starts with a non-token char.", str, 0);
    }
}
