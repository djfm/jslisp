import node from './node';

export class StreamBuilder {
    constructor (src) {
        this._arr = [];
        this._pos    = 0;
        this._lastTakenNodes = [];
        this._stack = [];

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

    setSourceStream (stream) {
        this._sourceStream = stream;
        return this;
    }

    takeLastTakenNodes () {
        const nodes = this._lastTakenNodes;
        this._lastTakenNodes = [];
        return nodes;
    }

    takeSourceLastTakenNodes () {
        return this._sourceStream ?
            this._sourceStream.takeLastTakenNodes() :
            []
        ;
    }

    push (value) {
        this._arr.push(node(value, this.takeSourceLastTakenNodes()));
        return this;
    }

    pushChild () {
        this._stack.push({
            _lastTakenNodes: this.takeSourceLastTakenNodes(),
            _arr: this._arr
        });
        this._arr = [];
        return this;
    }

    exitChild (value) {
        const state = this._stack.pop();
        const children = [].concat(
            state._lastTakenNodes,
            this._arr,
            this.takeSourceLastTakenNodes()
        );
        const tree = node(value, children);
        this._arr = state._arr.concat(tree);
        this._lastTakenNodes = [];
        return this;
    }

    getNode (index) {
        index = +(index || 0);
        return this._arr[index];
    }

    getPos () {
        return this._pos;
    }

    nodeCount () {
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

export default function streamBuilder (src) {
    return new StreamBuilder(src);
}
