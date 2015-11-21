function isTokenChar (c) {
    return !!/^\w|[+\-*/\\]$/.exec(c);
}

export default function run (src, out) {
    let token = "";

    function done () {
        out.push(token);
        const node = out.getNode();
        node.setTokenType('identifier');
    }

    while (!src.eos()) {
        let c = src.peekOne();
        if (isTokenChar(c)) {
            token += c;
            src.takeOne();
        } else {
            if (token.length > 0) {
                done();
                return;
            } else {
                return `Expected a token char, but got "${c}".`;
            }
        }
    }

    if (token.length > 0) {
        done();
    }
}
