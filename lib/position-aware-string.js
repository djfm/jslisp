export class Position {
    constructor (line, column) {
        this.line = line;
        this.column = column;
    }

    toString () {
        return `[${this.line}:${this.column}]`;
    }
}

export default class PositionAwareString {
    constructor (str, line, column) {
        this._position = new Position(+(line || 1), +(column || 1));
        this._originalString = str;
        this.length = str.length;
    }

    getPosition (index) {
        index = +(index || 0);
        let {line, column} = this._position;
        for (let i = 0; i < index; ++i) {
            const c = this._originalString[i];
            if (c === "\n") {
                column = 1;
                ++line;
            } else {
                ++column;
            }
        }
        return new Position(line, column);
    }

    rest (cutIndex) {
        const str = this._originalString.substr(cutIndex);
        const {line, column} = this.getPosition(cutIndex);
        return new PositionAwareString(str, line, column);
    }

    toString () {
        return this._originalString;
    }

    charAt (index) {
        return this._originalString[index];
    }
}

export function string (str) {
    if (str instanceof PositionAwareString) {
        return str;
    } else {
        return new PositionAwareString(str);
    }
}
