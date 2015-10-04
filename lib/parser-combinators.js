import _ from 'underscore';

import {just, nothing} from './parse-result';
import {string} from './position-aware-string';

function setPropertyOnSuccess (property, parser) {
    return str => {
        const result = parser(str);
        if (result.hasNode()) {
            result.set(property);
        }
        return result;
    };
}

function appendNodes (target, parseResult) {
    if (!parseResult.is('skipped')) {
        if (parseResult.is('splat')) {
            var nodes = parseResult.getNode();
            if (Object.prototype.toString.call(nodes) === '[object Array]') {
                target.push.apply(target, nodes);
            }
        } else {
            target.push(parseResult.getNode());
        }
    }
}

export default {
    sequence () {
        return str => {
            str = string(str);
            const nodes = [];
            for (const parser of _.toArray(arguments)) {
                const result = parser(str);
                if (result.hasNode()) {
                    str = result.getRest();
                    appendNodes(nodes, result);
                } else {
                    return result;
                }
            }

            return just(nodes, str);
        };
    },
    skip (parser) {
        return setPropertyOnSuccess('skipped', parser);
    },
    splat (parser) {
        return setPropertyOnSuccess('splat', parser);
    },
    zeroOrMore (parser) {
        return str => {
            str = string(str);
            const nodes = [];
            let result;
            while ((result = parser(str))) {
                if (result.hasNode()) {
                    str = result.getRest();
                    appendNodes(nodes, result);
                } else {
                    break;
                }
            }
            return just(nodes, str);
        };
    },
    firstOf () {
        return str => {
            str = string(str);
            for (const parser of _.toArray(arguments)) {
                const result = parser(str);
                if (result.hasNode()) {
                    return result;
                }
            }
            return nothing("None of the alternatives matched.", str, 0);
        };
    }
};
