/**
 * Created by mehmetyaman on 14.08.2017.
 */
'use strict';

var should = require('chai').should();

describe('addition', function () {
    it('should add 1+1 correctly', function (done) {
        var onePlusOne = 1 + 1;
        onePlusOne.should.equal(2);
        // must call done() so that mocha know that we are... done.
        // Useful for async tests.
        done();
    });
});
