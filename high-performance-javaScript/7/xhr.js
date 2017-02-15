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