import chai from 'chai';
chai.should();
/* global describe, it */

import streamReader from '../lib/streamReader';
import streamWriter from '../lib/streamWriter';
import {Node} from '../lib/node';

describe('A StreamReader', function () {

    it('should create nodes from values', function () {
        const writer = streamWriter(streamReader());
        writer.push("a");
        writer.getNode(0).should.be.an.instanceof(Node);
    });

    it('should count nodes', function () {
        const writer = streamReader("a");
        writer.nodesCount().should.equal(1);
    });

    describe('produces a stream that', function () {
        it('can be consumed value by value', function () {
            const writer = streamReader("a");
            writer.takeOne().should.equal("a");
            writer.eos().should.equal(true);
        });
        it('can be peeked at without changing position', function () {
            const writer = streamReader("a");
            writer.peekOne().should.equal("a");
            writer.eos().should.equal(false);
        });
    });

    describe('built from a string', function () {
        it('should accept a string as input and split it into char nodes', function () {
            const writer = streamReader("hello");
            writer.nodesCount().should.equal(5);
        });

        it('should keep track of line and column information', function () {
            const writer = streamReader("h\nel\n\nlo");

            writer.getNode(0).getLocation().should.deep.equal({
                row: 1,
                col: 1,
                endRow: 1,
                endCol: 1,
                len: 1
            });

            writer.getNode(1).getLocation().should.deep.equal({
                row: 1,
                col: 2,
                endRow: 1,
                endCol: 2,
                len: 1
            });

            writer.getNode(2).getLocation().should.deep.equal({
                row: 2,
                col: 1,
                endRow: 2,
                endCol: 1,
                len: 1
            });

            writer.getNode(7).getLocation().should.deep.equal({
                row: 4,
                col: 2,
                endRow: 4,
                endCol: 2,
                len: 1
            });
        });
    });
});

describe('A StreamWriter', function () {
    it('should automatically build the node hierarchy according to nodes taken', function () {
        const reader = streamReader("ab");
        const writer = streamWriter(reader);
        reader.takeOne();
        reader.takeOne();
        writer.push("AB");
        writer.getNode(0).getChildren().length.should.equal(2);
    });
    it('should build a node hierarchy that keeps track of node locations', function () {
        const reader = streamReader("ab");
        const writer = streamWriter(reader);
        reader.takeOne();
        reader.takeOne();
        writer.push("AB");
        writer.getNode(0).getLocation().should.deep.equal({
            row: 1,
            col: 1,
            endRow: 1,
            endCol: 2,
            len: 2
        });
    });
    it('should build a node hierarchy that keeps track of source code', function () {
        const reader = streamReader("ab");
        const writer = streamWriter(reader);
        reader.takeOne();
        reader.takeOne();
        writer.push("AB");
        writer.getNode(0).getSource().should.equal("ab");
    });
});
