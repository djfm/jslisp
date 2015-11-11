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
import astNode from '../ast-node';

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

    const result = sequence(
        whitespace,
        a(listOpener),
            items(firstOf(
                stringParser,
                tokenParser,
                listParser
            )),
        whitespace,
        a(listCloser)
    )(str);

    if (result.hasNode()) {
        result.setNode(transformNode(result.getNode()));
    }

    return result;
}

function transformNode (node) {
    const newNode = [];
    let leadingQuote = false;

    for (let item of node) {
        if (item.getValue() === "'") {
            leadingQuote = item;
        } else {
            /* jshint maxdepth:4 */
            if (leadingQuote) {
                if (item.getKind() === 'list') {
                    item.getValue().unshift(astNode('list', 'identifier', []));
                    newNode.push(item);
                } else {
                    const list = astNode([
                        astNode('quote', 'identifier', []),
                        item
                    ], 'list', []);
                    newNode.push(list);
                }
                leadingQuote = null;
            } else {
                newNode.push(item);
            }
        }
    }

    if (leadingQuote) {
        newNode.push(leadingQuote);
    }

    return astNode(newNode, 'list', []);
}
