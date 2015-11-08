function compileDeclaration (ast, context) {
    const decls = [];
    let i = 1, len = ast.getValue().length, toReturn, varName;
    for (; i < len - 1; i+=2) {
        const variable = ast.getValue()[i];
        varName = toReturn = variable.getValue();
        const rhs = compileAST(ast.getValue()[i+1], context);
        const info = context.declare(variable, rhs);
        if (info.getRole() !== 'macro') {
            decls.push(`    var ${varName} = ${rhs};`);
        }
    }

    if (i < len) {
        // if we have a body, it is to be returned by the block
        toReturn = compileAST(ast.getValue()[i], context);
    }

    return ast.setCode(`(function () {
${decls.join("\n")}
    return ${toReturn};
})()`);
}

function compileLambda (ast, context) {
    const rawArgs = getArgs(ast, context, 1, ast.getValue().length - 1);
    const args = rawArgs.join(', ');
    const body = compileAST(ast.getValue()[ast.getValue().length - 1], context);
    const src  = `(function (${args}) {
    return ${body};
})`;
    return ast.setCode(src);
}

function compileMacro (ast, context) {
    return compileLambda(ast, context).setRole('macro');
}

function getArgs (ast, context, from, to) {
    return ast.getValue().slice(from || 1, to).map(node => {
        return compileAST(node, context.newScope());
    });
}

function compileIf (ast, context) {
    const args = getArgs(ast, context);
    return ast.setCode(`(${args[0]} ? ${args[1]} : ${args[2]})`);
}

function compileToken (token) {
    if (token.getKind() === 'identifier') {
        return token.setCode(token.getValue());
    } else {
        return token.setCode(JSON.stringify(token.getValue()));
    }
}

function compileApplication (ast, context) {
    const args = getArgs(ast, context);
    const head = ast.getValue()[0];
    const info = context.getNodeInfo(head);

    if (info.getRole() === 'macro') {
        return context.evalMacro(head);
    } else {
        let appCode;
        if (head.getKind() === 'identifier') {
            appCode = head.getValue();
            if (appCode === 'log') {
                appCode = 'console.log';
            }
        } else {
            appCode = compileAST(head, context);
        }
        return ast.setCode(writeFunctionCall(appCode, args, context));
    }
}

function writeFunctionCall (app, args, context) {
    const binOp = {
        '=': '===',
        '+':'+', '-':'-', '*':'*', '/':'/'
    }[app];
    if (binOp) {
        return writeBinaryOperatorCall(binOp, args, context);
    }
    return `${app}(${args.join(', ')})`;
}

function writeBinaryOperatorCall (op, args) {
    return `(${args[0]} ${op} ${args[1]})`;
}

function compileList (ast) {
    const args = ast.getValue().slice(1).map(node => {
        return node.toJS();
    });
    return ast.setCode(JSON.stringify(args));
}

export default function compileAST (ast, context) {
    if (ast.getKind() === 'list') {
        const head = ast.getValue()[0];
        if (head.getKind() === 'identifier') {
            const identifier = head.getValue();
            switch (identifier) {
                case 'if':
                    return compileIf(ast, context);
                case 'let':
                    return compileDeclaration(ast, context);
                case 'lambda':
                    return compileLambda(ast, context);
                case 'macro':
                    return compileMacro(ast, context);
                case 'list':
                    return compileList(ast, context);
                case 'true':
                    return head;
                default:
                    return compileApplication(ast, context);
            }
        } else {
            return compileApplication(ast, context);
        }
    } else {
        return compileToken(ast, context);
    }
}
