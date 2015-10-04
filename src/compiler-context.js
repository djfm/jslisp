export default class CompilerContext {
    constructor () {
        this._symbols = {};
    }

    describe (symbol, type) {
        if (arguments.length > 1) {
            if (this._symbols[symbol]) {
                throw new Error(`Cannot describe '${symbol}' as both a '${this._symbols[symbol]}' and a '${type}'`);
            }
            this._symbols[symbol] = type;
            return this;
        } else {
            return this._symbols[symbol];
        }
    }
}
