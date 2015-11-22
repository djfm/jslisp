import parserRunner     from '../lib/parserRunner';

import whitespaceParser from '../lib/parsers/whitespace';
import commentParser    from '../lib/parsers/comment';
import stringParser     from '../lib/parsers/string';
import listParser       from '../lib/parsers/list';
import tokenParser      from '../lib/parsers/token';
import node             from '../lib/node';

function wrapError (maybeError) {
    if (maybeError) {
        throw new Error(
            `Error at (${maybeError.row},${maybeError.col}): ${maybeError.message}`
        );
    }
}

export default function compile (jslispSourceCode) {
    const runner = parserRunner(jslispSourceCode);

    const strict = {
        unterminatedPatternIsAnError: true
    };

    // first parse strings because they may contain
    // syntactically significant tokens
    wrapError(runner.runAtAllStartingPositions(
        stringParser,
        strict
    ));

    // then parse comments, it is OK to have
    // strings in them cuz code may use them
    runner.runAtAllStartingPositions(commentParser);

    // we need to separate list items,
    // so group whitespace
    runner.runAtAllStartingPositions(whitespaceParser);

    runner.runAtAllStartingPositions(tokenParser);

    // Now we can safely parse all list structures
    wrapError(runner.runAtAllStartingPositions(
        listParser,
        strict
    ));

    const stream = runner.getStream();
    if (stream._arr.length > 1) {
        return node(null, stream._arr).setTokenType("list");
    } else {
        return stream._arr[0];
    }
}
