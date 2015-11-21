import chai from 'chai';
chai.should();
/* global describe, it */

import compiler from '../src/compiler';

describe('The JSLISP Compiler', function () {
    describe('recognizes wellformed code', function () {
        it('should compile a basic arithmetic operation', function () {
            compiler("(+ 1 2)");
        });
    });
    describe('produces friendly error messages', function () {
        it ('shoud error on unterminated list', function () {
            chai.expect(() => {
                compiler("(+ 1 ");
            }).to.throw('Error at (1,5): Unterminated list.');
        });
        it ('shoud error on unbalanced list', function () {
            chai.expect(() => {
                compiler("(+ 1))");
            }).to.throw('Error at (1,6): Unexpected end-of-list symbol.');
        });
    });
});
