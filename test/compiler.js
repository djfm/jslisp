import chai from 'chai';
chai.should();
/* global describe, it */

import compiler from '../src/compiler';

describe('The JSLISP Compiler', function () {
    describe('recognizes wellformed code', function () {
        it('should compile a token', function () {
            const node = compiler("hello");
            node.getSource().should.equal("hello");
            node.getTokenType().should.equal("identifier");
        });
        it('should compile an integer constant', function () {
            const node = compiler("123");
            node.getSource().should.equal("123");
            node.getValue().should.equal(123);
            node.getTokenType().should.equal("constant");
        });
        it('should compile a floating point constant', function () {
            const node = compiler("123.456");
            node.getSource().should.equal("123.456");
            node.getValue().should.equal(123.456);
            node.getTokenType().should.equal("constant");
        });
        it('should compile the `false` constant', function () {
            const node = compiler("false");
            node.getSource().should.equal("false");
            node.getValue().should.equal(false);
            node.getTokenType().should.equal("constant");
        });
        it('should compile the `true` constant', function () {
            const node = compiler("true");
            node.getSource().should.equal("true");
            node.getValue().should.equal(true);
            node.getTokenType().should.equal("constant");
        });
        it('should compile a string', function () {
            const node = compiler(`"hello"`);
            node.getSource().should.equal(`"hello"`);
            node.getValue().should.equal("hello");
            node.getTokenType().should.equal("string");
        });
        it('should compile a basic arithmetic operation', function () {
            compiler("(+ 1 2)");
        });
    });
    describe('produces friendly error messages', function () {
        it('should error on unterminated list', function () {
            chai.expect(() => {
                compiler("(+ 1 ");
            }).to.throw('Error at (1,5): Unterminated list.');
        });
        it('should error on unbalanced list', function () {
            chai.expect(() => {
                compiler("(+ 1))");
            }).to.throw('Error at (1,6): Unexpected end-of-list symbol.');
        });
        it('should error on unterminated string', function () {
            chai.expect(() => {
                compiler('"this is an error');
            }).to.throw('Error at (1,17): Unterminated string.');
        });
    });
    describe('always yields a list', function () {
        it('yields a list when the top level form IS NOT an explicit list', function () {
            const ast = compiler("+ 1 2");
            ast.getNode(0).getSource().should.equal("+");
        });
        it('yields a list when the top level form IS an explicit list', function () {
            const ast = compiler("(+ 1 2)");
            ast.getNode(0).getSource().should.equal("(");
        });
    });
});
