var path = require('path');
var defaultExtname = require('default-extname');
var defExt = defaultExtname();

var utils = {
    smartyMerge: function (rootObj, newObj, isNumParse) {
        newObj = newObj || {};
        var tempObj = {};
        for (var i in rootObj) {
            tempObj[i] = rootObj[i];
            if (i in newObj) {
                var temp = newObj[i];
                var parseVal = parseFloat(temp, 10);
                if (isNumParse && !isNaN(parseVal)) {
                    temp = parseVal;
                }
                tempObj[i] = temp;
            }
        }
        return tempObj;
    },

    merge: function (rootObj, newObj) {
        rootObj = rootObj || {};
        newObj = newObj || {};
        for (var i in newObj) {
            if (newObj.hasOwnProperty(i)) {
                rootObj[i] = newObj[i];
            }
        }

        return rootObj;
    },

    strToPureRegStr: function (str) {
        return str.replace(/[-.\\[\]$+*^()?|:=!{},]/g, function (item) {
            return '\\' + item;
        });
    },

    regGenerator: function (keyword) {
        /**
         * $1: startSym
         * $2: keyword
         * $3: 『" or '』
         * $4: path
         */
        return new RegExp(['([^0-9a-zA-Z\\-_]|\\s+|^)(', keyword, ')\\((\'|")\\s*([^"\'*:><?\\|]+)\\3\\s*\\)(;??)'].join(''), 'g');
    },

    buildError: function (filePath, msg) {
        msg = msg || 'Not Found';
        return {
            file: filePath,
            content: '// ' + msg,
            error: true
        };
    },

    fixFilePath: function (fPath) {
        fPath = defExt.resolveFilePath(fPath);
        var newExtname = path.extname(fPath);
        return {
            path: fPath,
            extname: newExtname
        };
    },

    // 仅在解析文件内容中的依赖时使用
    resolvePath: function (currentFilePath, anotherPathParam, cwd, baseDir) {
        anotherPathParam = defExt.resolveFilePath(anotherPathParam);
        var currentFilePathDir = path.dirname(currentFilePath);
        var newFilePath;
        if (path.isAbsolute(anotherPathParam)) {
            newFilePath = path.join(cwd, baseDir, anotherPathParam);
        }
        else {
            newFilePath = path.resolve(currentFilePathDir, anotherPathParam);
        }
        var extname = path.extname(newFilePath);

        return {
            dir: path.dirname(newFilePath),
            file: path.basename(newFilePath),
            filePath: newFilePath,
            extname: extname
        };
    },

    // 解析依赖
    resolveCombine: function (fileGroup) {
        var groupMap = {};
        fileGroup.forEach(function (fileInfo) {
            groupMap[fileInfo.filePath] = fileInfo;
        });

        var combinedMap = {};
        var resolveOrder = [];
        var resolveUnit = function (fileInfo) {
            if (fileInfo.dependencies.length) {
                fileInfo.dependencies.forEach(function (depFileInfo) {
                    resolveUnit(groupMap[depFileInfo.filePath]);
                });
            }
            if (!combinedMap[fileInfo.filePath]) {
                combinedMap[fileInfo.filePath] = true;
                resolveOrder.push(fileInfo);
            }
        };
        fileGroup.forEach(function (fileInfo) {
            resolveUnit(fileInfo);
        });

        return resolveOrder;
    },

    unikey: function (len) {
        len = len || 9;
        var result = '';
        for(; result.length < len; result += Math.random().toString(36).substr(2));
        return result.substr(0, len);
    },

    notFoundMsg: function (filePath) {
        return '/*Not Found: ' + filePath + '*/';
    },

    notFoundErr: function (filePath, referPath) {
        return new Error('Can not find module ' + filePath + (referPath ? (' from ' + referPath + '.') : '.'));
    },

    // 预处理参数
    preParseParam: function (pathParam, baseDir) {
        pathParam = path.join(baseDir, pathParam);
        return defExt.resolveFilePath(pathParam);
    },

    mdwFilePath: function (filePath, cwd) {
        filePath = defExt.resolveFilePath(filePath);
        if (filePath.indexOf(cwd) === -1) {
            filePath = path.join(cwd, filePath);
        }
        return filePath;
    }
};

module.exports = utils;
