import {just, nothing} from '../parse-result';
import {string} from '../position-aware-string';

export default function regExpParser (regExp) {
    return str => {
        str = string(str);

        var match = regExp.exec(str);
        if (match) {
            if (match.index !== 0) {
                return nothing("Match starts later in the string.");
            }
            return just(match[0], str.rest(match[0].length));
        } else {
            return nothing("String does not match.", str, 0);
        }
    };
}
