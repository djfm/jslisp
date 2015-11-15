import chai from 'chai';
chai.should();
/* global describe, it */

import parserRunner     from '../lib/parserRunner';
import whitespaceParser from '../lib/parsers/whitespace';
import commentParser    from '../lib/parsers/comment';

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
});
