/* global describe, it */
import chai from 'chai'; chai.should();

import jslisp from '../src/index';

describe('The compiler', function () {
    it('should compile the hello world', function () {
        jslisp.compile('(log "hello world")').should.equal('console.log("hello world");');
    });

    it('should compile a simple if statement', function () {
        jslisp.compile('(if true yay nay)').should.equal(`(true ? "yay" : "nay")`);
    });

    it('should evaluate a simple if statement', function () {
        jslisp.evaluate('(if true yay nay)').should.equal("yay");
    });

    it('should compile a variable declaration', function () {
        jslisp.compile('(let x 4)').should.equal(
`(function () {
    var x = 4;
    return x;
})()`
);
    });

    it('should compile a series of variable declarations', function () {
        jslisp.compile('(let x 4 y 5)').should.equal(
`(function () {
    var x = 4;
    var y = 5;
    return y;
})()`
);
    });

    it('should evaluate a series of variable declarations', function () {
        jslisp.evaluate('(let x 4 y 5)').should.equal(5);
    });

    it('should evaluate a variable declaration', function () {
        jslisp.evaluate('(let x 4)').should.equal(4);
    });

    it('should allow a body inside declaration blocks: the body is the last item in the list if items are odd-numbered', function () {
        jslisp.compile('(let x 4 (+ x 38))').should.equal(
`(function () {
    var x = 4;
    return (x + 38);
})()`
);
    });

    it('should evaluate and return the evaluated body of a declaration block', function () {
        jslisp.evaluate('(let x 4 (+ x 38))').should.equal(42);
    });

    it('should compile a lambda expression', function () {
        jslisp.compile('(lambda x 42)').should.equal(
`(function (x) {
    return 42;
})`
);
    });

    it('should compile an equality test', function () {
        jslisp.compile('(= 1 3)').should.equal('(1 === 3)');
    });

    it('should compile an addition', function () {
        jslisp.compile('(+ 1 3)').should.equal('(1 + 3)');
    });

    it('should compile an subtraction', function () {
        jslisp.compile('(- 1 3)').should.equal('(1 - 3)');
    });

    it('should compile an assignment of a lambda', function () {
        jslisp.compile('(let f (lambda x 42))').should.equal(
`(function () {
    var f = (function (x) {
    return 42;
});
    return f;
})()`);
    });

    it('should evaluate the Fibonacci program', function () {
        const src =
        `(let fib (lambda n
                (if (= n 0)
                    0
                    (if (= n 1)
                        1
                        (+ (fib (- n 1)) (fib (- n 2)))
                    )
                )
            )
            (fib 4)
        )`;
        jslisp.evaluate(src).should.equal(3);
    });

    it('should not allow shadowing a variable - nested declarations', function () {
        chai.expect(() => {jslisp.compile(`(let x 4 (let x 5))`);}).to.throw();
    });

    it('should not allow shadowing a variable - same declaration', function () {
        chai.expect(() => {jslisp.compile(`(let x 4 x 5)`);}).to.throw();
    });
});
