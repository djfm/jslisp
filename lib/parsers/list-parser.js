import charParser from './char-parser';
import tokenParser from './token-parser';
import stringParser from './string-parser';
import regExpParser from './regexp-parser';
import {
    sequence,
    skip,
    splat,
    zeroOrMore,
    firstOf
} from '../parser-combinators';

const whitespace = skip(regExpParser(/^\s*/));
const a = function (char) {
    return skip(charParser(char));
};
const items = function (parser) {
    return splat(zeroOrMore(splat(sequence(whitespace, parser))));
};

export default function listParser (str) {
    const listOpener = '(';
    const listCloser = ')';

    return sequence(
        a(listOpener),
            items(firstOf(
                stringParser,
                tokenParser,
                listParser
            )),
        whitespace,
        a(listCloser)
    )(str);
}
