export default class CompilerContext {
    constructor (parentContext) {
        this._parentContext = parentContext;
        this._symbols = {};
    }

    tokenType (symbol, type) {
        if (arguments.length > 1) {
            if (this._symbols[symbol]) {
                throw new Error(`Cannot describe '${symbol}' as both a '${this._symbols[symbol]}' and a '${type}'`);
            }
            this._symbols[symbol] = type;
            return this;
        } else {
            return this._symbols[symbol] || (this._parentContext ? this._parentContext.tokenType(symbol) : undefined);
        }
    }

    newScope () {
        return new CompilerContext(this);
    }
}
