/**
 * 资源关系解析
 */
var fs = require('fs');
var Promise = require('promise');
var path = require('path');
var utils = require('./utils');
var defaultExtname = require('default-extname');
var defExt = defaultExtname();

var srcResolver = function (opt) {
    this.opt = utils.smartyMerge({
        cwd: '',
        keyword: 'imports',
        basedir: '',
        encoding: 'utf-8'
    }, opt || {});

    this.rootDir = path.join(this.opt.cwd, this.opt.basedir);
    this.getReg = function () {
        return utils.regGenerator(this.opt.keyword);
    };
    this.srcMap = {};
    // 用于记录树的层级
    this.levelCount = 0;
    this.levelMap = [];
};

/**
 * 解析入口
 * @param  {[type]} filePath  入口文件路径
 * @return {[type]}           [description]
 */
srcResolver.prototype.resolve = function (filePath, onEnd, onErr) {
    var opt = this.opt;
    var self = this;
    this.srcMap = {};
    this.levelCount = 0;
    this.levelMap = [];
    // 名称处理
    filePath = defExt.resolveFilePath(filePath);
    // 绝对路径
    var baseDir = path.join(opt.cwd, opt.basedir);
    filePath = path.resolve(baseDir, filePath);
    this.fileReader(
        filePath,
        0,
        null,
        function () {
            onEnd && onEnd(self.srcMap, self.levelMap, filePath);
        },
        onErr
    );
};

srcResolver.prototype.fileReader = function (filePath, levelCount, referPath, onEnd, onErr) {
    var self = this;
    if (self.srcMap[filePath]) {
        self.buildSrcMap(
            filePath,
            self.srcMap[filePath].originCode,
            levelCount,
            referPath,
            onEnd,
            onErr
        );
    }
    else {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                onErr && onErr(utils.notFoundErr(filePath));
                return false;
            }
            self.buildSrcMap(
                filePath,
                data.toString(),
                levelCount,
                referPath,
                onEnd,
                onErr
            );
        });
    }
};

srcResolver.prototype.buildSrcMap = function (filePath, fileContent, levelCount, referPath, onEnd, onErr) {
    filePath = defExt.resolveFilePath(filePath);
    fileContent = fileContent.toString();
    var reg = this.getReg();
    var opt = this.opt;
    var cwd = opt.cwd;
    var basedir = opt.basedir || '';
    var matchArr;
    var dependencies = [];
    var absolutePath = path.resolve(filePath);
    var filePathInfo = utils.fixFilePath(absolutePath);
    var extname = filePathInfo.extname;
    var srcMap = this.srcMap;
    var self = this;
    absolutePath = filePathInfo.path;
    if (!this.levelMap[levelCount]) {
        this.levelMap[levelCount] = {};
    }
    this.levelMap[levelCount][absolutePath] = true;
    if (!srcMap[absolutePath]) {
        srcMap[absolutePath] = {
            absolutePath: absolutePath,
            originCode: fileContent,
            codeFragment: null,
            resolvedCode: null,
            hasResolved: false,
            parents: [],
            _parentsMap: {},
            deps: [],
            _depsMap: {}
        };
    }
    var currentMap = srcMap[absolutePath];
    // 创建父级参数
    var currentParents = currentMap.parents;
    var currentParentsMap = currentMap._parentsMap;
    if (referPath && !currentParentsMap[referPath]) {
        currentParents.push({filePath: referPath});
        currentParentsMap[referPath] = true;
    }
    var currentDeps = currentMap.deps;
    var currentDepsMap = currentMap._depsMap;
    var codeFragment = [];
    var execResult;
    var needToResolvedCount = 0;
    var noDeps = true;
    var cur = 0;
    var partContent;
    var startStep = false;
    while (execResult = reg.exec(fileContent)) {
        if (startStep === false) {
            cur = startStep = execResult.index;
        }
        noDeps = false;
        var pathParam = execResult[4];
        var info = utils.merge({
            pathParam: pathParam
        }, utils.resolvePath(filePath, pathParam, cwd, basedir));
        // 开始符号
        if (execResult[1]) {
            codeFragment.push(execResult[1]);
        }
        partContent = fileContent.slice(cur, execResult.index);
        if (partContent) {
            codeFragment.push(partContent);
        }
        codeFragment.push({
            thirdPart: true,
            id: info.filePath
        });
        // 结尾符号
        if (execResult[5]) {
            codeFragment.push(execResult[5]);
        }
        cur = execResult.index + execResult[0].length;
        needToResolvedCount++;
        if (!currentDepsMap[info.filePath]) {
            currentDeps.push({filePath: info.filePath});
            currentDepsMap[info.filePath] = true;
        }
        self.fileReader(
            info.filePath,
            levelCount + 1,
            filePath,
            function () {
                needToResolvedCount--;
                if (needToResolvedCount <= 0) {
                    onEnd && onEnd(srcMap);
                }
            },
            onErr
        );
    }
    if (noDeps) {
        codeFragment.push(fileContent);
        onEnd && onEnd(srcMap);
    }
    else {
        // 头部
        if (startStep) {
            codeFragment.unshift(
                fileContent.slice(0, startStep)
            );
        }
        // 尾部
        partContent = fileContent.slice(cur, fileContent.length);
        if (partContent) {
            codeFragment.push(partContent);
        }
    }
    if (!currentMap.codeFragment) {
        currentMap.codeFragment = codeFragment;
    }
};

module.exports = srcResolver;
