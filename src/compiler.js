function isList (ast) {
    return Object.prototype.toString.call(ast) === "[object Array]";
}

function compileRValue (ast, context) {
    if (isList(ast)) {
        return compileAST(ast, context);
    } else {
        return ast.toString();
    }
}

function compileDeclaration (ast, context) {
    const decls = [];
    let i = 1, len = ast.length, toReturn, varName;
    for (; i < len - 1; i+=2) {
        varName = toReturn = ast[i];
        context.tokenType(toReturn, 'symbol');
        const rhs = compileRValue(ast[i+1], context);
        if (rhs.symbolType) {
            context.symbolType(toReturn, rhs.symbolType);
        }
        if (rhs.symbolType === 'macro') {
            context.compileTimeDefine(varName, rhs.compiled);
        } else {
            decls.push(`    var ${varName} = ${rhs};`);
        }
    }

    if (i < len) {
        // if we have a body, it is to be returned by the block
        toReturn = compileAST(ast[i], context);
    }

    return`(function () {
${decls.join("\n")}
    return ${toReturn};
})()`;
}

function compileBinaryOperation (ast, context) {
    const operator = {
        '=': '==='
    }[ast[0]] || ast[0];
    return `(${compileAST(ast[1], context.newScope())} ${operator} ${compileAST(ast[2], context.newScope())})`;
}

function compileLambda (ast, context) {
    const rawArgs = ast.slice(1, ast.length - 1);
    rawArgs.forEach(arg => {
        context.tokenType(arg, 'symbol');
    });
    const args = rawArgs.join(', ');
return `(function (${args}) {
    return ${compileAST(ast[ast.length - 1], context)};
})`;
}

function compileMacro (ast, context) {
    var src = compileLambda(ast, context);
    const code = {
        str: src,
        toString () {
            return this.str;
        },
        symbolType: 'macro',
        compiled: src
    };
    return code;
}

function compileIf (ast, context) {
    return `(${compileAST(ast[1], context)} ? ${compileAST(ast[2], context)} : ${compileAST(ast[3], context)})`;
}

function compileToken (token, context) {
    if (context.tokenType(token) === 'symbol') {
        return token;
    } if (/\d+/.exec(token)) {
        return token;
    } else {
        return JSON.stringify(token);
    }
}

function compileApplication (ast, context) {
    const args = ast.slice(1).map(arg => {
        return compileAST(arg, context);
    }).join(', ');

    if (context.symbolType(ast[0]) === 'macro') {
        return context.evalMacro(ast[0]);
    } else {
        const app = compileAST(ast[0], context);
        return `${app}(${args})`;
    }
}

export default function compileAST (ast, context) {
    const head = isList(ast) ? ast[0] : ast;

    switch (head) {
        case 'log':
            return 'console.log(' + JSON.stringify(ast[1]) + ');';
        case 'if':
            return compileIf(ast, context);
        case 'let':
            return compileDeclaration(ast, context);
        case 'lambda':
            return compileLambda(ast, context);
        case 'macro':
            return compileMacro(ast, context);
        case '=':
        case '+':
        case '-':
        case '*':
        case '/':
            return compileBinaryOperation(ast, context);
        case 'true':
            return head;
        default:
            if (!isList(ast)) {
                return compileToken(head, context);
            } else {
                return compileApplication(ast, context);
            }
    }
}
