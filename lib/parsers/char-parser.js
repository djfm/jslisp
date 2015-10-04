import {just, nothing} from '../parse-result';
import {string} from '../position-aware-string';

export default function charParser (char) {
    return function parseChar (str) {
        str = string(str);
        if (str.charAt(0) === char) {
            return just(char, str.rest(1));
        } else {
            return nothing(`Char does not match, expected "${char}" but got "${str.charAt(0)}".`, str, 0);
        }
    };
}
