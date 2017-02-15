// 动态加载JavaScript文件
function loadScript(url, callback){
    var script = document.createElement ("script")
    script.type = "text/javascript";
    if (script.readyState){ //IE
        script.onreadystatechange = function(){
            if (script.readyState == "loaded" || script.readyState == "complete"){
                script.onreadystatechange = null;
                callback();
            }
        };
    } else { //Others
        script.onload = function(){
            callback();
        };
    }
    script.src = url;
    document.getElementsByTagName("head")[0].appendChild(script);
}

// 集合转数组函数
function toArray(coll) {
    for (var i = 0, a = [], len = coll.length; i < len; i++) {
        a[i] = coll[i];
    }
    return a;
}

// 通用制表函数 memoize(factorial, { "0": 1, "1": 1 })
function memoize(fundamental, cache){
    cache = cache || {};
    var shell = function(arg){
        if (!cache.hasOwnProperty(arg)){
            cache[arg] = fundamental(arg);
        }
        return cache[arg];
    };
    return shell;
}


if (!String.prototype.trim) {
    // String.prototype.trim = function() {
    //     return this.replace(/^\s+/, "").replace(/\s+$/, "");
    // }
    String.prototype.trim = function() {
        var str = this.replace(/^\s+/, ""),
        end = str.length - 1,
        ws = /\s/;
        while (ws.test(str.charAt(end))) {
            end--;
        }
        return str.slice(0, end + 1);
    }

}


function processArray(items, process, callback){
    var todo = items.concat(); //create a clone of the original
    setTimeout(function(){
        process(todo.shift());
        if (todo.length > 0){
            setTimeout(arguments.callee, 25);
        } else {
        callback(items);
        }
    }, 25);
}


function timedProcessArray(items, process, callback){
    var todo = items.concat(); //create a clone of the original
    setTimeout(function(){
        var start = +new Date();
        do {
            process(todo.shift());
        } while (todo.length > 0 && (+new Date() - start < 50));
        if (todo.length > 0){
            setTimeout(arguments.callee, 25);
        } else {
            callback(items);
        }
    },25);
}

// 失败时重试
function xhrPost(url, params, callback) {
    var req = new XMLHttpRequest();
    req.onerror = function() {
        setTimeout(function() {
            xhrPost(url, params, callback);
        }, 1000);
    };
    req.onreadystatechange = function() {
        if (req.readyState == 4) {
            if (callback && typeof callback === 'function') {
                callback();
            }
        }
    };
    req.open('POST', url, true);
    req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.setRequestHeader('Content-Length', params.length);
    req.send(params.join('&'));
}

// json字符串转换成对象
function parseJSON(responseText) {
    return ('(' + responseText + ')');
}

function createXhrObject() {
    var msxml_progid = [
    'MSXML2.XMLHTTP.6.0',
    'MSXML3.XMLHTTP',
    'Microsoft.XMLHTTP', // Doesn't support readyState 3.
    'MSXML2.XMLHTTP.3.0', // Doesn't support readyState 3.
    ];
    var req;
    try {
        req = new XMLHttpRequest(); // Try the standard way first.
    }
    catch(e) {
        for (var i = 0, len = msxml_progid.length; i < len; ++i) {
            try {
            req = new ActiveXObject(msxml_progid[i]);
            break;
            }
            catch(e2) { }
        }
    }
    finally {
        return req;
    }
}