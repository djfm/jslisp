export default function run (src, out) {
    const quote = `"`, escape = "\\";
    let c, str = '', escaping = false;

    if ((c = src.takeOne()) !== quote) {
        return `Expected a double quote, got "${c}".`;
    }

    while (!src.eos()) {
        c = src.takeOne();
        if (c === quote) {
            if (escaping) {
                str += quote;
                escaping = false;
            } else {
                out.push(str);
                return;
            }
        } else if (c === escape) {
            escaping = true;
        } else {
            if (escaping) {
                str += escape;
                escaping = false;
            }
            str += c;
        }
    }

    return "Unterminated string.";
}