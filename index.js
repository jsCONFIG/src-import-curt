var evts = require('event-stream');
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
    var resolveGroup = buildResolveCenter(opt);
    var processCenter = function (file, cbk) {
        opt.cwd = file.cwd;
        if (file.isBuffer()) {
            resolveGroup.resolve(
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
