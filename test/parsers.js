import chai from 'chai';
chai.should();
/* global describe, it */

import parserRunner     from '../lib/parserRunner';
import whitespaceParser from '../lib/parsers/whitespace';
import commentParser    from '../lib/parsers/comment';
import stringParser    from '../lib/parsers/string';

describe('The Parsers', function () {
    describe('A Whitespace Parser', function () {
        it('should parse a sequence of whitespace chars', function () {
            const runner = parserRunner("  ");
            runner.run(whitespaceParser);
            const stream = runner.getStream();
            stream.eos().should.equal(true, "stream should be at eos()");
            stream.nodeCount().should.equal(1);
            stream.getNode(0).getSource().should.equal("  ");
            stream.getNode(0).getChildren().length.should.equal(2);
        });
        it('should stop at the first non-whitespace char', function () {
            const runner = parserRunner("  a");
            runner.run(whitespaceParser);
            const stream = runner.getStream();
            stream.eos().should.equal(false, "stream should not be at eos()");
            stream.nodeCount().should.equal(2);
            stream.getNode(0).getSource().should.equal("  ");
            stream.getNode(1).getSource().should.equal("a");
        });
        it('should yield an error if string doesn\'t start with whitespace', function () {
            const runner = parserRunner("a   ");
            const error  = runner.run(whitespaceParser);
            const stream = runner.getStream();
            stream.getPos().should.equal(0);
            error.message.should.equal(`Expected a whitespace character, but found "a".`);
            error.row.should.equal(1);
            error.col.should.equal(1);
        });
    });

    describe('A Comment Parser', function () {
        it('should parse lines starting with a semi-colon', function () {
            const runner = parserRunner(";hello");
            runner.run(commentParser);
            const stream = runner.getStream();
            stream.eos().should.equal(true, "stream should be at eos()");
            stream.getNode(0).getValue().should.equal("hello");
            stream.getNode(0).getSource().should.equal(";hello");
        });
        it('should stop after the first line break', function () {
            const runner = parserRunner(";hello\nworld");
            runner.run(commentParser);
            const stream = runner.getStream();
            stream.eos().should.equal(false, "stream should not be at eos()");
            stream.getNode(0).getValue().should.equal("hello");
            stream.getNode(0).getSource().should.equal(";hello\n");
            stream.getNode(1).getSource().should.equal("w");
        });
    });

    describe('A String Parser', function () {
        it('should parse a simple string', function () {
            const runner = parserRunner(`"hello"`);
            runner.run(stringParser);
            const stream = runner.getStream();
            stream.eos().should.equal(true, "stream should be at eos()");
            stream.getNode(0).getValue().should.equal("hello");
            stream.getNode(0).getSource().should.equal(`"hello"`);
        });
        it('should parse a string with an escaped quote', function () {
            const input = `"hel\\\"lo"`;
            input.length.should.equal(9, "Test string probably has the wrong number of escape chars.");
            const runner = parserRunner(input);
            runner.run(stringParser);
            const stream = runner.getStream();
            stream.eos().should.equal(true, "stream should be at eos()");
            stream.getNode(0).getValue().should.equal("hel\"lo");
            stream.getNode(0).getSource().should.equal(input);
        });
        it('should not ignore an escape char in front of a non-quote', function () {
            const input = `"h\\i"`;
            const runner = parserRunner(input);
            runner.run(stringParser);
            const stream = runner.getStream();
            stream.eos().should.equal(true, "stream should be at eos()");
            stream.getNode(0).getValue().should.equal("h\\i");
            stream.getNode(0).getSource().should.equal(input);
        });
        it('should produce an error if string is unterminated', function () {
            const input = `"hi`;
            const runner = parserRunner(input);
            const error = runner.run(stringParser);
            const stream = runner.getStream();
            error.message.should.equal('Unterminated string.');
            error.row.should.equal(1);
            error.col.should.equal(3);
            stream.getPos().should.equal(0, "A failed parse should not advance the stream.");
            stream.nodeCount().should.equal(3, "A failed parse should not change the stream.");
        });
    });
});
