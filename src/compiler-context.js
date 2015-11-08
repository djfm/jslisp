import compiler from './compiler';
import parse from '../lib/parsers/list-parser';

export default class CompilerContext {
    constructor (parentContext) {
        this._scope = parentContext ? Object.create(parentContext._scope) : {};
    }

    declare (varNode, code) {
        const varName = varNode.getValue();

        if (varName in this._scope) {
            throw new Error(`Cannot redeclare '${varName}'.`);
        }

        this._scope[varName] = code;

        return this.getNodeInfo(varNode);
    }

    getNodeInfo (ast) {
        const toProxy = ['getRole', 'getType', 'getKind'];
        const info = {};

        let srcObj = ast;

        if (ast.getKind() === 'identifier') {
            const identifier = ast.getValue();
            if (identifier in this._scope) {
                srcObj = this._scope[identifier];
            }
        }

        toProxy.forEach(method => {
            info[method] = srcObj[method].bind(srcObj);
        });
        return info;
    }

    newScope () {
        return new CompilerContext(this);
    }

    evalMacro (macro) {
        let macroName;

        if (macro.getKind() === 'identifier') {
            macroName = macro.getValue();
        } else {
            throw new Error(`NIY: calling evalMacro on a non-identifier.`);
        }
        var compileTimeCode = '';
        for (let varName in this._scope) {
            var code = this._scope[varName];
            compileTimeCode += `var ${varName} = ${code};\n`;
        }
        compileTimeCode += `return ${macroName}();`;


        const toEval = `(function(){${compileTimeCode}})()`;
        /* jshint evil:true */
        const jsRepresentation = eval(toEval);
        const jsLispCode = jsRepresentationToJSLisp(jsRepresentation);

        const toCompile = parse(`(${jsLispCode})`).getNode().getValue()[0];

        const jsCode = compiler(toCompile, this);

        return jsCode;
    }
}

function jsRepresentationToJSLisp (js) {
    if (Object.prototype.toString.call(js) === '[object Array]') {
        return `(${js.map(jsRepresentationToJSLisp).join(' ')})`;
    } else if ((typeof js === 'object') && ('kind' in js)) {
        return js.value;
    } else {
        return JSON.stringify(js);
    }
}
