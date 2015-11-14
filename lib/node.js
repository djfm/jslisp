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
}
