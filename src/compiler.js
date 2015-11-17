import parserRunner     from '../lib/parserRunner';

import whitespaceParser from '../lib/parsers/whitespace';
import commentParser    from '../lib/parsers/comment';
import stringParser     from '../lib/parsers/string';
import listParser       from '../lib/parsers/list';

function wrapError (maybeError) {
    if (maybeError) {
        throw new Error();
    }
}

export default function compile (jslispSourceCode) {
    const runner = parserRunner(jslispSourceCode);

    // first parse strings because they may contain
    // syntactically significant tokens
    runner.run(stringParser);

    // then parse comments, it is OK to have
    // strings in them cuz code may use them
    runner.run(commentParser);

    // we need to separate list items,
    // so group whitespace
    runner.run(whitespaceParser);

    // Now we can safely parse all list structures
    wrapError(
        runner.run(listParser)
    );
}
