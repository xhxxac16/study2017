
function $$(selector, context){
    context = context || document;
    var elements = context.querySelectorAll(selector);
    return Array.prototype.slice.call(elements);
}

// 检测某个样式属性是否被支持 testProperty('textShadow')
function testProperty(property){
    var root = document.documentElement;
    if(property in root.style){
        root.classList.add(property.toLowerCase());
        return true;
    }

    root.classList.add('no-' + property.toLowerCase());
    return false;
}

//检测某个具体的属性值是否支持 testValue('lineargradients', 'linear-gradient(red, tan)', 'backgroundImage')
function testValue(id, value, property){
    var dummy = document.createElement('p');
    dummy.style[property] = value;

    if(dummy.style[property]){
        root.classList.add(id);
        return true;
    }

    root.classList.add('no-' + id);
    return false;
}