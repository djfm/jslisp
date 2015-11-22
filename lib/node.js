export default function node (value, children) {
    return new Node(value, children);
}

export class Node {
    constructor (value, children) {
        this._value = value;
        this._children = children || [];
        if (this._children.length > 0) {
            const loc = Object.assign({}, this._children[0].getLocation(), {len: 0});
            let node;
            for (node of this._children) {
                loc.len += node.getLocation().len;
            }
            loc.endRow = node.getLocation().endRow;
            loc.endCol = node.getLocation().endCol;
            this.setLocation(loc);
        }
    }

    getValue () {
        return this._value;
    }

    head () {
        if (this.getTokenType() !== 'list') {
            throw new Error(`Cannot call head on a node of tokenType "${this.getTokenType()}".`);
        }
        return this.getValue()[0];
    }

    getNode (index) {
        return this.getChildren()[+(index || 0)];
    }

    setLocation (location) {
        this._location = location;
        return this;
    }

    getLocation () {
        return this._location;
    }

    getChildren () {
        return this._children;
    }

    getSource () {
        if (this.getChildren().length === 0) {
            return this.getValue();
        } else {
            return this.getChildren().map(child => {
                return child.getSource();
            }).join('');
        }
    }

    setTokenType (tokenType) {
        this._tokenType = tokenType;
        return this;
    }

    getTokenType () {
        return this._tokenType;
    }

    setCode (code) {
        this._code = code;
        return this;
    }

    getCode () {
        return this._code;
    }

    toString () {
        return this.getCode();
    }
}
