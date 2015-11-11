class ASTNode {
    constructor (value, kind, type) {
        this._value = value;
        this._kind = kind;
        this._type = type;
        this._role = undefined;
        this._code = undefined;
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

    setRole (role) {
        this._role = role;
        return this;
    }

    getRole () {
        return this._role;
    }

    setCode (code) {
        this._code = code;
        return this;
    }

    getCode () {
        return this._code;
    }

    toJS () {
        if (this._kind === 'list') {
            return this._value.map(function (v) {
                return v.toJS();
            });
        } else if (this._kind === 'identifier') {
            if (this._value[0] === ':') {
                return this._value.substring(1);
            }
            return {kind: "identifier", value: this._value};
        } else {
            return this._value;
        }
    }

    toString () {
        return this.getCode();
    }
}

export default function makeNode (value, kind, type) {
    return new ASTNode(value, kind, type);
}
