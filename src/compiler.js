import parserRunner     from '../lib/parserRunner';

import whitespaceParser from '../lib/parsers/whitespace';
import commentParser    from '../lib/parsers/comment';
import stringParser     from '../lib/parsers/string';
import listParser       from '../lib/parsers/list';

function wrapError (maybeError) {
    if (maybeError) {
        throw new Error(
            `Error at (${maybeError.row},${maybeError.col}): ${maybeError.message}`
        );
    }
}

export default function compile (jslispSourceCode) {
    const runner = parserRunner(jslispSourceCode);

    // first parse strings because they may contain
    // syntactically significant tokens
    runner.runAtAllStartingPositions(stringParser);

    // then parse comments, it is OK to have
    // strings in them cuz code may use them
    runner.runAtAllStartingPositions(commentParser);

    // we need to separate list items,
    // so group whitespace
    runner.runAtAllStartingPositions(whitespaceParser);

    // Now we can safely parse all list structures
    wrapError(
        runner.runAtAllStartingPositions(listParser, {
            unterminatedPatternIsAnError: true
        })
    );
}
