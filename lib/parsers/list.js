export default function run (src, out) {
    let first = true, item;
    while ((item = src.takeOne()) !== undefined) {
        if (first && (item !== "(")) {
            return "Expected a left-paren \"(\".";
        } else {
            first = false;
        }

        if (item === "(") {
            out.pushChild();
        } else if (item === ")") {
            out.exitChild();
        } else {
            out.push();
        }
    }
}
