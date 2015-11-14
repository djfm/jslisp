export default function node (value, children) {
    return new Node(value, children);
}

export class Node {
    constructor (value, children) {
        this._value = value;
    }

    getValue () {
        return this._value;
    }

    setLocation (row, col, len) {
        this._location = {
            row, col, len
        };
        return this;
    }

    getLocation () {
        return this._location;
    }
}
