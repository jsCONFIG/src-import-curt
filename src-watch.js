/**
 * 文件监听
 */
var gulpWatch = require('gulp-watch');

var watchFile = function (watchInst, fileGroup, opts) {
    if (!watchInst) {
        watchInst = gulpWatch(file, opts || {}, function () {});
    }
    else {
        watchInst.add();
    }
    return watchInst;
    return gulpWatch(file, opts || {}, function () {

    });
};