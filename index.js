var fs = require('fs');
var path = require('path');
var evts = require('event-stream');
var Promise = require('promise');
var utils = require('./utils');
var SrcResolver = require('./src-resolve');
var combineUtil = require('./src-combine');

var buildResolveCenter = function (opt) {
    var parser = new SrcResolver(opt);
    var resolveMain = function (file, onEnd, onError) {
            parser.resolve(
                file.path,
                function (srcMap, levelMap, entrance) {
                    onEnd && onEnd(
                        combineUtil(entrance, srcMap, levelMap)
                    );
                },
                function (err) {
                    onError && onError(err);
                }
            );
    };
    return {
        parser: parser,
        resolve: resolveMain
    };
};

var srcImportCurt = function (opt) {
    opt = opt || {};
    var processCenter = function (file, cbk) {
        var self = this;
        opt.cwd = file.cwd;
        var resolveGroup = buildResolveCenter(opt);
        if (file.isBuffer()) {
            var resolveResult = resolveGroup.resolve(
                file,
                function (code) {
                    file.contents = new Buffer(code);
                    cbk(null, file);
                },
                function (err) {
                    cbk(err);
                }
            );
        }
    };

    return evts.map(processCenter);
};

module.exports = srcImportCurt;