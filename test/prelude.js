/* global describe, it */
import chai from 'chai'; chai.should();
import jslisp from '../index';

describe('The Standard Library', function () {
    it('has a `head` function to take things off the beginning of a list', function () {
        jslisp.evaluate(`(head (list 1 2))`).should.equal(1);
    });
    it('has a `tail` function to take the end of a list', function () {
        jslisp.evaluate(`(tail (list 1 2))`).should.deep.equal([2]);
    });
    it('has a `cons` function to build a list from a head and a tail', function () {
        jslisp.evaluate(`(cons 1 (list 2 3))`).should.deep.equal([1, 2, 3]);
    });
});
