import lexer from './lexer';

export default function compile (jslispSourceCode) {
    return compileAST(lexer(jslispSourceCode));
}

function compileAST (ast) {
    if (ast.getTokenType() === 'identifier') {
        return compileIdentifier(ast);
    } else if (ast.getTokenType() === 'constant') {
        return compileConstant(ast);
    } else if (ast.getTokenType() === 'string') {
        // TODO
    } else if (ast.getTokenType() === 'list') {
        return compileFunctionCall(ast);
    }

    return ast;
}

function compileIdentifier (ast) {
    return ast.setCode(ast.getValue());
}

function compileConstant (ast) {
    return ast.setCode(JSON.stringify(ast.getValue()));
}

function isBinaryOperator (node) {
    const ops = {'+': true};
    return ops[node.getValue()];
}

function compileFunctionCall (ast) {
    const [head, ...rest] = ast.getValue().map(compileAST);

    if (isBinaryOperator(head)) {
        ast.setCode(`(${rest[0]} ${head} ${rest[1]})`);
    }

    return ast;
}
