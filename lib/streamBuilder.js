import node from './node';

export class StreamBuilder {
    constructor (src) {
        this._stream = [];
        this._pos    = 0;
        this._lastTakenNodes = [];

        if (typeof src === "string") {
            let row = 1, col = 1;
            for (const c of src) {
                this._stream.push(node(c).setLocation({
                    row, col, len: 1,
                    endRow: row, endCol: col
                }));
                ++col;
                if (c === "\n") {
                    ++row;
                    col = 1;
                }
            }
        }
    }

    setSourceStream (stream) {
        this._sourceStream = stream;
        return this;
    }

    takeLastTakenNodes () {
        const nodes = this._lastTakenNodes;
        this._lastTakenNodes = [];
        return nodes;
    }

    push (value) {
        const children = this._sourceStream ?
            this._sourceStream.takeLastTakenNodes() :
            []
        ;
        this._stream.push(node(value, children));
        return this;
    }

    getNode (index) {
        index = +(index || 0);
        return this._stream[index];
    }

    nodeCount () {
        return this._stream.length;
    }

    takeOne () {
        const node = this._stream[this._pos++];
        this._lastTakenNodes.push(node);
        return node.getValue();
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
