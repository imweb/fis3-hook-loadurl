/**
 * require.loadUrl dependency hook
 * @author lqlongli
 * 
 */

function addFileDeps(file, id) {
    // console.log('addFileDeps', file.subpath, id);
    file.extras.loadUrls = file.extras.loadUrls || [];
    if (id && (id = id.trim())) {
        // 已经在同步依赖中，则忽略
        if (~file.requires.indexOf(id)) {
            return id;
        }

        // if (!~this.asyncs.indexOf(id)) {
        //     this.asyncs.push(id);
        // }

        if (!~file.extras.loadUrls.indexOf(id)) {
            file.extras.loadUrls.push(id);
        }

        return id;
    }
    return false;
}

function addDeps(file, value) {
    var hasBrackets = false;
    var values = [];

    value = value.trim().replace(/(^\[|\]$)/g, function(m, v) {
        if (v) {
            hasBrackets = true;
        }
        return '';
    });
    values = value.split(/\s*,\s*/);
    values = values.map(function(v) {
        var info = fis.project.lookup(v, file);
        var ret;

        // file.addAsyncRequire(info.id);
        addFileDeps(file, info.id);
        if (info.file && info.file.isFile()) {
            file.addLink(info.file.subpath);
        }

        if (info.moduleId) {
            ret = info.quote + info.moduleId + info.quote;
        } else {
            ret = info.quote + info.id + info.quote;
        }

        return ret;
    });

    return {
        values: values,
        hasBrackets: hasBrackets
    };
}

/**
 * 处理 html 或者 js 内容, 识别 require.loadUrl 的用法，并将其转换成中间码。
 * 这里是特殊的新增内容，所以自处理，不做中间码的步骤拆分的逻辑
 *
 * - require.loadUrl(path, function() {}) to require loadUrl resource
 *
 * @param {String} content js 内容
 * @param {Callback} callback 正则替换回调函数，如果不想替换，请传入 null.
 * @param {File} file js 内容所在文件。
 * 
 */
function ext(content, callback, file) {
    var reg = /"(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|\b(require\.loadUrl)\s*\(\s*("(?:[^\\"\r\n\f]|\\[\s\S])*"|'(?:[^\\'\n\r\f]|\\[\s\S])*'|\[[\s\S]*?\])\s*/g;
    var res;

    callback = callback || function(m, type, value) {
        if (type) {
            res = addDeps(file, value);
            if (res.hasBrackets) {
                m = 'require.loadUrl([' + res.values.join(', ') + ']';
            } else {
                m = 'require.loadUrl(' + res.values.join(', ');
            }
        }
        return m;
    };
    content = content.replace(reg, callback);

    return content;
}

module.exports = function(fis, opts) {
    // 用standard:restore:end的原因是html会有inline的情况
    // 必须要等inline操作完成之后才能开始分析处理
    fis.on('standard:restore:end', function(file) {
        if (file.isJsLike || file.isHtmlLike) {
            file.setContent(ext(file.getContent(), null, file));
        }
    });
};
