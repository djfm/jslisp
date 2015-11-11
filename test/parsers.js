/* global describe, it */
import chai from 'chai'; chai.should();

import stringParser     from '../lib/parsers/string-parser';
import listParser       from '../lib/parsers/list-parser';
import tokenParser      from '../lib/parsers/token-parser';
import regExpParser     from '../lib/parsers/regexp-parser';

function id (value) {
    return {
        kind: "identifier",
        value
    };
}

describe('The parsers', function () {
    describe('A string parser', function () {
        it('should recognize a simple string', function () {
            const node = stringParser(`"hello"`).getNode();
            node.getValue().should.equal(`hello`);
            node.getType().should.deep.equal(["string"]);
            node.getKind().should.equal("literal");
        });

        it('should recognize a string with an escaped quote', function () {
            stringParser(`"hel\\"lo"`).getNode().getValue().should.equal(`hel"lo`);
        });

        it('should recognize a string with an escape char that does not escape anything', function () {
            stringParser(`"hel\\lo"`).getNode().getValue().should.equal(`hel\\lo`);
        });

        it('should keep track of what remains to be parsed', function () {
            stringParser(`"hello" world`).getRest().toString().should.equal(` world`);
        });

        it('should fail to parse an invalid string', function () {
            const result = stringParser(`hello`);
            result.hasNode().should.equal(false);
        });

        it('should fail to parse an unterminated string', function () {
            stringParser(`"hello`).hasNode().should.equal(false);
        });
    });

    describe('A regExpParser', function () {
        it('should parse "hello" using a regexp', function () {
            regExpParser(/^hello/)('hello').getNode().should.equal('hello');
        });

        it('should correctly determine what\'s left to parse', function () {
            regExpParser(/^hello/)('hello world').getRest().toString().should.equal(' world');
        });

        it('should not take into account matches that don\'t start at 0', function () {
            regExpParser(/hello/)(' hello').hasNode().should.equal(false);
        });

        it('should not recognize an invalid string', function () {
            regExpParser(/^hello/)('heeeello').hasNode().should.equal(false);
        });
    });

    describe('A token parser', function () {
        it('should recognize any sequence of chars not containing whitespace', function () {
            const result = tokenParser('hello');
            result.hasNode().should.equal(true);
            result.getNode().getValue().should.equal("hello");
            result.getNode().getKind().should.equal("identifier");
            result.getNode().getType().should.deep.equal([]);
        });

        it('should stop at the first whitespace char encountered', function () {
            const result = tokenParser('hello world');
            result.hasNode().should.equal(true);
            result.getNode().getValue().should.equal("hello");
            result.getRest().toString().should.equal(" world");
        });

        it('should stop at the first closing paren encountered', function () {
            const result = tokenParser('hello) world');
            result.hasNode().should.equal(true);
            result.getNode().getValue().should.equal("hello");
            result.getRest().toString().should.equal(") world");
        });

        it('should fail to recognize anything if input starts with whitespace', function () {
            tokenParser(' hello').hasNode().should.equal(false);
        });
    });

    describe('A list parser', function () {
        it('should recognize the empty list', function () {
            listParser(`()`).getNode().toJS().should.deep.equal([]);
        });

        it('should recognize a list containing a single token', function () {
            listParser(`(hello)`).getNode().toJS().should.deep.equal([id('hello')]);
        });

        it('should recognize a list containing 2 tokens', function () {
            listParser(`(hello world)`).getNode().toJS().should.deep.equal([id('hello'), id('world')]);
        });

        it('should recognize a list containing a string and a token', function () {
            listParser(`("hello" world)`).getNode().toJS().should.deep.equal(['hello', id('world')]);
        });

        it('should recognize a list containing the empty list', function () {
            listParser(`(())`).getNode().toJS().should.deep.equal([[]]);
        });

        it('should recognize a list containing the empty list containing the empty list', function () {
            listParser(`((()))`).getNode().toJS().should.deep.equal([[[]]]);
        });

        it('should recognize a more complex nested list', function () {
            listParser(`(a b c ("d" e   (f "g")))`).getNode().toJS().should.deep.equal([
                id('a'), id('b'), id('c'), [
                    'd', id('e'), [
                        id('f'), 'g'
                    ]
                ]
            ]);
        });

        it('should recognize something with a line break at the end of the list', function () {
            listParser(`(def fib (
            ))`).getNode().toJS().should.deep.equal([id('def'), id('fib'), []]);
        });

        it('should add the quote operator as a "list" symbol in the immediately following list', function () {
            listParser(`('(hello))`).getNode().toJS().should.deep.equal([[id('list'), id('hello')]]);
        });

        it('but a quote preceding an identifier quotes the identifier', function () {
            listParser(`(' hi)`).getNode().toJS().should.deep.equal([[id("quote"), id("hi")]]);
        });

        it('but a quote preceding an identifier without whitespace also quotes the identifier', function () {
            listParser(`('hi)`).getNode().toJS().should.deep.equal([[id("quote"), id("hi")]]);
        });

        it('but a quote terminating a list is just a regular identifier', function () {
            listParser(`(hi ')`).getNode().toJS().should.deep.equal([id("hi"), id("'")]);
        });
    });
});
