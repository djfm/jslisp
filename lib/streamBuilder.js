import node from './node';

export class StreamBuilder {
    constructor (src) {
        this._stream = [];
        this._pos    = 0;

        if (typeof src === "string") {
            let row = 1, col = 1;
            for (const c of src) {
                this._stream.push(node(c).setLocation(row, col, 1));
                ++col;
                if (c === "\n") {
                    ++row;
                    col = 1;
                }
            }
        }
    }

    push (value) {
        this._stream.push(node(value));
    }

    getNode (index) {
        index = +(index || 0);
        return this._stream[index];
    }

    nodeCount () {
        return this._stream.length;
    }

    takeOne () {
        return this._stream[this._pos++].getValue();
    }

    peekOne () {
        return this._stream[this._pos].getValue();
    }

    eos () {
        return this._pos >= this._stream.length;
    }
}

export default function streamBuilder (src) {
    return new StreamBuilder(src);
}
