export default function run (src, out) {
    let first = true, item;
    while ((item = src.peekOneNode()) !== undefined) {
        const value = item.getValue();

        if (first && (value !== "(")) {
            return "Expected a left-paren \"(\".";
        } else {
            first = false;
        }

        src.takeOne();
        if (value === "(") {
            out.pushChild();
        } else if (value === ")") {
            if (out.depth() === 0) {
                return 'Unexpected end-of-list symbol.';
            }
            out.exitChild().setTokenType('list');
        } else if (item.getTokenType() !== 'whitespace') {
            out.pushNode(item);
        }
    }

    if (out.depth() > 0) {
        return 'Unterminated list.';
    }
}
