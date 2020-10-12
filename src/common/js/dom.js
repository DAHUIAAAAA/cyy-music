/**
 * 
 * @param {domElm} el 
 * @param {String} className 
 */
export function addClass(el, className) {
    if (hasClass(el, className)) return;

    el.classList.add(className);
}

/**
 * 
 * @param {domElm} el 
 * @param {String} className 
 */
export function hasClass(el, className) {
    if (el.classList[`${className}`]) return true;
    return false;
}

/**
 * 
 * @param {domElm} el 
 * @param {String} name 
 */
export function getData(el, name) {
    const prefix = 'data-'
    return el.getAttribute(prefix + name);
}

const elemStyle = document.createElement('div').style;

let vender = (()=>{
    const transformNames = {
        webkit: 'webkitTransform',
        Moz: 'MozTransform',
        O: 'OTransform',
        ms: 'msTransform',
        standard: 'transform'
    }

    for(let key in transformNames) {
        if(elemStyle[transformNames[key]] !== undefined) return key;
    }

    return false;
})();

export function prefixStyle(style) {
    if(vender === false) return false;

    if(vender === 'standard') return style;

    return vender + style.charAt(0).toUpperCase() + style.substr(1);
}
