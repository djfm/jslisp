function isTokenChar (c) {
    return !!/^(?:\w|[+\-*/\\.])$/.exec(c);
}

export default function run (src, out) {
    let token = "";

    function done () {
        let value = token;
        let tokenType = 'identifier';

        if (/^\d+(?:\.\d+)?$/.exec(token)) {
            tokenType = 'constant';
            value = +token;
        } else if (/^(?:true|false)$/.exec(token)) {
            tokenType = 'constant';
            value = JSON.parse(token);
        }

        out.push(value).setTokenType(tokenType);
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
