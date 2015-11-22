export default function run (src, out) {
    let first = true, item;
    while ((item = src.peekOne()) !== undefined) {
        if (first && (item !== "(")) {
            return "Expected a left-paren \"(\".";
        } else {
            first = false;
        }

        src.takeOne();

        if (item === "(") {
            out.pushChild();
        } else if (item === ")") {
            if (out.depth() === 0) {
                return 'Unexpected end-of-list symbol.';
            }
            out.exitChild().setTokenType('list');
        } else {
            out.push();
        }
    }

    if (out.depth() > 0) {
        return 'Unterminated list.';
    }
}
