export default function run (src, out) {
    let c, str = '';

    while (/^\s$/.exec(c = src.peekOne())) {
        str += c;
        src.takeOne();
    }

    if (str !== '') {
        out.push(str);
        return true;
    } else {
        return `Expected a whitespace character, but found "${c}".`;
    }
}
