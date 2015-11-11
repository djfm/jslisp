/* global describe, it */
import chai from 'chai'; chai.should();
import js_beautify from 'js-beautify';

import jslisp from '../src/index';

chai.use(function (chai) {
  var Assertion = chai.Assertion;
  Assertion.addMethod('jsEqual', function (rawExpectedCode) {
      const opts = {
          preserve_newlines: false
      };
      const actualCode = js_beautify(this._obj, opts);
      const expectedCode = js_beautify(rawExpectedCode, opts);
      this.assert(
          actualCode === expectedCode,
          "expected #{act} to be the same code as #{exp}",
          "expected #{act} to not be the same code as #{exp}",
          expectedCode,
          actualCode,
          true
      );
  });
});

describe('The compiler', function () {
    it('should compile the hello world', function () {
        jslisp.compile('(log "hello world")').should.jsEqual('console.log("hello world")');
    });

    it('should compile a simple if statement', function () {
        jslisp.compile('(if true yay nay)').should.equal(`(true ? yay : nay)`);
    });

    it('should evaluate a simple if statement', function () {
        jslisp.evaluate('(if true "yay" "nay")').should.equal("yay");
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

    it('should evaluate an iife', function () {
        jslisp.evaluate('((lambda x (+ x 1)) 1)').should.equal(2);
    });

    it('should evaluate an iife with 3 parameters', function () {
        jslisp.evaluate('((lambda x y z (+ x (+ y z))) 1 2 3)').should.equal(6);
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
        jslisp.compile('(let f (lambda x 42))').should.jsEqual(`
            (function () {
                var f = (function (x) {
                    return 42;
                });
                return f;
            })()
        `);
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

    it('but variables with the same name may exist in different scopes - binary operators', function () {
        jslisp.evaluate(`(+ (let x 4) (let x 5))`).should.equal(9);
    });

    it('but variables with the same name may exist in different scopes - applications', function () {
        jslisp.evaluate(`(let (+ (let x 4) (let x 5)))`).should.equal(9);
    });

    it('a quote operator should escape regular interpretation', function () {
        jslisp.compile(`(let sum '(+ 1 2))`).should.jsEqual(`(function () {
            var sum = [{"kind": "identifier", "value": "+"}, 1, 2];
            return sum;
        })()`);
    });

    it('should compile code with non-JS identifiers', function () {
        jslisp.evaluate(`(let \\\\ (+ 1 2) \\\\)`).should.equal(3);
    });

    describe('Macros', function () {
        it('should define a trivial macro', function () {
            jslisp.compile('(let eight (macro (+ 5 3)) (eight))').should.jsEqual(`
                (function () {
                    return 8;
                })()
            `);
        });
        it('should understand the quote operator to return literal code - lists', function () {
            jslisp.compile(`(let eight (macro '(+ 5 3)) (eight))`).should.jsEqual(`
                (function () {
                    return (5 + 3);
                })()
            `);
        });
        it('should understand the quote operator to return literal code - identifier', function () {
            jslisp.compile(`(let hi 'world)`).should.jsEqual(`(function () {
                var hi = {"kind": "identifier", "value": "world"};
                return hi;
            })()`);
        });
        it('should define a macro that uses a regular function', function () {
            const src = jslisp.compile(`(let
                square (lambda x (* x x))
                sixteen (macro (square 4))
                (sixteen)
            )`);
            src.should.jsEqual(`(function () {
                var square = (function (x) {
                    return (x * x);
                });
                return 16;
            })()`);
        });
        it('should be able to use functions defined after them in the same scope', function () {
            const src = jslisp.compile(`(let
                sixteen (macro (square 4))
                square (lambda x (* x x))
                (sixteen)
            )`);
            src.should.jsEqual(`(function () {
                var square = (function (x) {
                    return (x * x);
                });
                return 16;
            })()`);
        });
        it('should be able to define a shorthand notation for lambdas', function () {
            const src = `
                    (let
                        \\ (macro args (cons 'lambda args))
                        ((\\ x y (+ x y)) 3 4)
            )`;
            jslisp.compile(src).should.jsEqual(`(function () {
                return (function (x, y) { return (x + y); })(3, 4);
            })()`);

            jslisp.evaluate(src).should.equal(7);
        });
        it('should evaluate escaped expressions', function () {
            const src = `
                (let listSum
                        (macro args
                            (let
                                x (head args)
                                y (head (tail args))
                                s (+ x y)
                                '(list :s :s)
                            ))
                        (listSum 1 3))
            `;
            jslisp.compile(src).should.jsEqual(`(function () {
                return [4, 4];
            })()`);
        });
    });
});

/**

(let switch
    (macro pivot test branch otherTests
        (if (test pivot) branch
            (switch pivot otherTests))))

(switch x (> 2) "some" (> 5) "many" _ "few")
 */
