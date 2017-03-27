/**
 * 资源并入
 */
var srcCombine = function (entryFileId, srcMap, levelOrder) {
    if (!levelOrder || !levelOrder.length) {
        return srcMap[entryFileId].originCode;
    }
    var unit;
    for (var cur = levelOrder.length - 1; cur >= 0; cur--) {
        var level = levelOrder[cur] || {};
        for (var filePath in level) {
            if (level.hasOwnProperty(filePath)) {
                unit = srcMap[filePath];
                if (!unit.hasResolved) {
                    if (unit.deps.length) {
                        unit.resolvedCode = (unit.codeFragment || []).map(function (codeFg) {
                            if (codeFg && codeFg.thirdPart) {
                                // 判断是否是最末枝节点
                                return srcMap[codeFg.id].deps.length ?
                                    srcMap[codeFg.id].resolvedCode :
                                    srcMap[codeFg.id].originCode;
                            }
                            return codeFg;
                        }).join('');
                    }
                    else {
                        unit.resolvedCode = unit.originCode;
                    }
                    unit.hasResolved = true;
                }
            }
        }
    }
    return srcMap[entryFileId].resolvedCode;
};

module.exports = srcCombine;
