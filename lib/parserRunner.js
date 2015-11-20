import streamReader from './streamReader';
import streamWriter from './streamWriter';

export class ParserRunner {
    constructor (str) {
        this._stream = streamReader(str);
    }

    run (parser) {
        const initialPos = this._stream.getPos();
        const out = streamWriter(this._stream);
        const res = parser(this._stream, out);

        if (typeof res === 'string') {
            const errNode = this._stream.getNode(Math.min(
                this._stream.getPos(),
                this._stream.nodeCount() - 1
            ));

            this._stream._pos = initialPos;
            this._stream._lastTakenNodes = [];

            return {
                message: res,
                row: errNode.getLocation().row,
                col: errNode.getLocation().col
            };
        } else {
            const endPos = this._stream.getPos();
            this._stream.replaceSegment(initialPos, endPos, out);
            return null;
        }
    }

    runAtAllStartingPositions (parser) {
        while (!this._stream.eos()) {
            const maybeError = this.run(parser);
            if (maybeError) {
                ++this._stream._pos;
            }
        }
        this._stream._pos = 0;
        return null;
    }

    getStream () {
        return this._stream;
    }
}

export default function parserRunner (str) {
    return new ParserRunner(str);
}
