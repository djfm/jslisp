# JSLisp

Just playing around with a lisp-like language that compiles to JS. [Eslisp](https://github.com/anko/eslisp) inspired me to do this but my approach is different and the result probably a lot worse. And yes, I know there are countless compile-to-js lisps already :)

## Usage

```javascript
    var jslisp = require('./index');
    console.log(jslisp.evaluate('(+ 1 2)')); // 3
```

## Examples

### Fibonacci

```
(let fib (lambda n
        (if (= n 0)
            0
            (if (= n 1)
                1
                (+ (fib (- n 1)) (fib (- n 2)))
            )
        )
    )
    (fib 4)
)
```
