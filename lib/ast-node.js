class ASTNode {
    constructor (value, kind, type) {
        this._value = value;
        this._kind = kind;
        this._type = type;
    }

    getType () {
        return this._type;
    }

    getKind () {
        return this._kind;
    }

    getValue () {
        return this._value;
    }

    toJS () {
        if (this._kind === 'list') {
            return this._value.map(function (v) {
                return v.toJS();
            });
        } else {
            return this._value;
        }
    }
}

export default function makeNode (value, kind, type) {
    return new ASTNode(value, kind, type);
}
