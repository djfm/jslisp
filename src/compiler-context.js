export default class CompilerContext {
    constructor (parentContext) {
        this._tokens = parentContext ? Object.create(parentContext._tokens) : {};
        this._compileTimeScope = parentContext ? Object.create(parentContext._compileTimeScope) : {};
    }

    tokenProp(token, prop, value) {
        const bag = this._tokens[token] = (this._tokens[token] || {});
        if (arguments.length > 2) {
            if (prop in bag) {
                throw new Error(`Cannot describe '${token}' as both a '${prop}:${bag[prop]}' and a '${prop}:${value}'`);
            }
            bag[prop] = value;
            return this;
        } else {
            return bag[prop];
        }
    }

    tokenType (token, type) {
        if (arguments.length > 1) {
            return this.tokenProp(token, 'tokenType', type);
        } else {
            return this.tokenProp(token, 'tokenType');
        }
    }

    symbolType (token, type) {
        if (arguments.length > 1) {
            return this.tokenProp(token, 'symbolType', type);
        } else {
            return this.tokenProp(token, 'symbolType');
        }
    }

    newScope () {
        return new CompilerContext(this);
    }

    compileTimeDefine (varName, srcCode) {
        this._compileTimeScope[varName] = srcCode;
        return this;
    }

    evalMacro (macroName) {
        var compileTimeCode = '';
        for (let varName in this._compileTimeScope) {
            var code = this._compileTimeScope[varName];
            compileTimeCode += `var ${varName} = ${code};\n`;
        }
        compileTimeCode += `return ${macroName}();`;

        const toEval = `(function(){${compileTimeCode}})()`;
        /* jshint evil:true */
        return eval(toEval);
    }
}
