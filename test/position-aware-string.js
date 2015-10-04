/* global describe, it */
import chai from 'chai'; chai.should();

import {string} from '../lib/position-aware-string';

describe('A PositionAwareString', function () {
    it('should be at [1:1] by default', function () {
        const s = string("hello");
        s.getPosition().toString().should.equal("[1:1]");
    });

    it('should be usable with regexps', function () {
        const s = string("hello");
        (!!/hello/.exec(s)).should.equal(true);
    });

    it('should update its position when cut', function () {
        const s = string("hello");
        s.rest(2).getPosition().toString().should.equal("[1:3]");
    });

    it('should update its position when cut after a line break', function () {
        const s = string("h\nello");
        const cut = s.rest(2);
        cut.getPosition().toString().should.equal("[2:1]");
        cut.toString().should.equal("ello");
    });

    it('should update its position when cut on a line break', function () {
        const s = string("he\nllo");
        const cut = s.rest(2);
        cut.getPosition().toString().should.equal("[1:3]");
        cut.toString().should.equal("\nllo");
    });

    it('should keep track of position after sevaral cuts', function () {
        const s = string("a\nb\ncde");
        const cut = s.rest(2).rest(2);
        cut.toString().should.equal('cde');
        cut.getPosition().toString().should.equal('[3:1]');
    });
});
