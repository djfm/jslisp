class JustParseResult {
    constructor (node, rest) {
        this._node = node;
        this._rest = rest;
        this._props = {};
    }

    hasNode () {
        return true;
    }

    getNode () {
        return this._node;
    }

    setNode (node) {
        this._node = node;
        return this;
    }

    getRest () {
        return this._rest;
    }

    set (property) {
        this._props[property] = true;
    }

    is (property) {
        return !!this._props[property];
    }
}

class NothingParseResult {
    constructor (reason, string, index) {
        this._reason = reason;
        this._string = string;
        this._index = index;
    }

    getReason () {
        return this._reason;
    }

    getIndex () {
        return this._index;
    }

    getString () {
        return this._string;
    }

    getPosition () {
        if (!this._string) {
            return "[?:?]";
        } else {
            return this._string.getPosition(+(this._index || 0));
        }
    }

    hasNode () {
        return false;
    }

    getNode () {
        throw new Error('getNode called on NothingParseResult');
    }
}

export default {
    just (node, rest) {
        return new JustParseResult(node, rest);
    },
    nothing (reason, string, index) {
        return new NothingParseResult(reason, string, index);
    }
};
