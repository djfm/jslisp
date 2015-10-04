export default class CompilerContext {
    constructor () {
        this._symbols = {};
    }

    describe (symbol, type) {
        if (arguments.length > 1) {
            this._symbols[symbol] = type;
            return this;
        } else {
            return this._symbols[symbol];
        }
    }
}
