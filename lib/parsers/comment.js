export default function run (src, out) {
    let c, str = '';

    c = src.peekOne();

    if (c !== ';') {
        return `Expected a semi-colon (;) but got "${c}".`;
    } else {
        src.takeOne();
        while ((c = src.takeOne()) !== undefined) {
            if (c !== '\n') {
                str += c;
            } else {
                break;
            }
        }
        out.push(str);
    }
}
