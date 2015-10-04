import listParser   from '../lib/parsers/list-parser';
import compiler     from './compiler';
import Context      from './compiler-context';

export default {
    parse (str) {
        const result = listParser(str);
        if (!result.hasNode()) {
            throw new Error(`Parse Error: "${result.getReason()}" at ${result.getPosition()}`);
        } else {
            return result.getNode();
        }
    },
    compile (str) {
        const ast = this.parse(str);
        return compiler(ast, new Context());
    },
    evaluate (str) {
        /* jshint evil:true */
        const js = this.compile(str);
        return eval(js);
    }
};
