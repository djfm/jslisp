import chai from 'chai';
chai.should();
/* global describe, it */

import streamBuilder from '../lib/streamBuilder';
import {Node} from '../lib/node';

describe('A StreamBuilder', function () {

    it('should create nodes from values', function () {
        const sb = streamBuilder();
        sb.push("a");
        sb.getNode(0).should.be.an.instanceof(Node);
    });

    it('should count nodes', function () {
        const sb = streamBuilder();
        sb.push("a");
        sb.nodeCount().should.equal(1);
    });

    describe('produces a stream that', function () {
        it('can be consumed value by value', function () {
            const sb = streamBuilder();
            sb.push("a");
            sb.takeOne().should.equal("a");
            sb.eos().should.equal(true);
        });
        it('can be peeked at without changing position', function () {
            const sb = streamBuilder();
            sb.push("a");
            sb.peekOne().should.equal("a");
            sb.eos().should.equal(false);
        });
    });

    describe('built from a string', function () {
        it('should accept a string as input and split it into char nodes', function () {
            const sb = streamBuilder("hello");
            sb.nodeCount().should.equal(5);
        });

        it('should keep track of line and column information', function () {
            const sb = streamBuilder("h\nel\n\nlo");

            sb.getNode(0).getLocation().should.deep.equal({
                row: 1,
                col: 1,
                endRow: 1,
                endCol: 1,
                len: 1
            });

            sb.getNode(1).getLocation().should.deep.equal({
                row: 1,
                col: 2,
                endRow: 1,
                endCol: 2,
                len: 1
            });

            sb.getNode(2).getLocation().should.deep.equal({
                row: 2,
                col: 1,
                endRow: 2,
                endCol: 1,
                len: 1
            });

            sb.getNode(7).getLocation().should.deep.equal({
                row: 4,
                col: 2,
                endRow: 4,
                endCol: 2,
                len: 1
            });
        });
    });

    describe('linked with a source stream', function () {
        it('should automatically build the node hierarchy according to nodes taken', function () {
            const srcSb = streamBuilder("ab");
            const sb = streamBuilder().setSourceStream(srcSb);
            srcSb.takeOne();
            srcSb.takeOne();
            sb.push("AB");
            sb.getNode(0).getChildren().length.should.equal(2);
        });
        it('should build a node hierarchy that keeps track of node locations', function () {
            const srcSb = streamBuilder("ab");
            const sb = streamBuilder().setSourceStream(srcSb);
            srcSb.takeOne();
            srcSb.takeOne();
            sb.push("AB");
            sb.getNode(0).getLocation().should.deep.equal({
                row: 1,
                col: 1,
                endRow: 1,
                endCol: 2,
                len: 2
            });
        });
    });
});
