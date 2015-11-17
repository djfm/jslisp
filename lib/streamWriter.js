import node from './node';
import {StreamReader} from './streamReader';

export class StreamWriter {
    constructor (stream) {
        this._sourceStream = stream;
        this._arr = [];
        this._stack = [];
    }

    push (value) {
        this._arr.push(
            node(
                value,
                this._sourceStream.takeLastTakenNodes()
            )
        );
        return this;
    }

    pushChild () {
        this._stack.push({
            _lastTakenNodes: this._sourceStream.takeLastTakenNodes(),
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
            this._sourceStream.takeLastTakenNodes()
        );
        const tree = node(
            arguments.length === 0 ? this._arr : value,
            children
        );
        this._arr = state._arr.concat(tree);
        return this;
    }

    getNode (...args) {
        return StreamReader.prototype.getNode.call(this, ...args);
    }

    depth () {
        return this._stack.length;
    }
}

export default function streamWriter (stream) {
    return new StreamWriter(stream);
}
