import node from './node';

export class StreamReader {
    constructor (src) {
        this._arr = [];
        this._pos    = 0;
        this._lastTakenNodes = [];

        if (typeof src === "string") {
            let row = 1, col = 1;
            for (const c of src) {
                this._arr.push(node(c).setLocation({
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

    takeLastTakenNodes () {
        const nodes = this._lastTakenNodes;
        this._lastTakenNodes = [];
        return nodes;
    }

    getNode (index) {
        index = +(index || 0);
        return this._arr[index];
    }

    getPos () {
        return this._pos;
    }

    nodesCount () {
        return this._arr.length;
    }

    takeOne () {
        if (this.eos()) {
            return undefined;
        }
        const node = this._arr[this._pos++];
        this._lastTakenNodes.push(node);
        return node.getValue();
    }

    peekOne () {
        if (this.eos()) {
            return undefined;
        }
        return this._arr[this._pos].getValue();
    }

    peekOneNode () {
        return this._arr[this._pos];
    }

    eos () {
        return this._pos >= this._arr.length;
    }

    replaceSegment (startPosInclusive, endPosExclusive, stream) {
        const replacedCount = endPosExclusive - startPosInclusive;
        this._arr.splice(
            startPosInclusive,
            replacedCount,
            ...stream._arr
        );
        this._pos += stream._arr.length - replacedCount;
        return this;
    }
}

export default function streamReader (src) {
    return new StreamReader(src);
}
