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