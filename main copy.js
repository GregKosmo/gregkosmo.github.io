if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js').then(function(registration) {
            // Registration was successful
            console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }, function(err) {
            // registration failed :(
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}

var isEmpty = function(object) {
    return (object === undefined || object === null);
}

var contains = function(object, ...containsObjects) {
    var doesContain = false;

    for(var containsObject of containsObjects) {
        if(object.indexOf(containsObject) !== -1) {
            doesContain = true;
            break;
        }
    }

    return doesContain;
}

var addClass = function(element, className) {
    var newClass = element.getAttribute('class') + ' ' + className;
    newClass = newClass.replace(/  +/g, ' ');
    element.setAttribute('class', newClass);
}

var removeClass = function(element, className) {
    var currentClass = element.getAttribute('class');
    
    if(!isEmpty(currentClass)) {
        var newClass = currentClass.replace(className, '');
        newClass = newClass.replace(/  +/g, ' ');
        element.setAttribute('class', newClass)
    }
}

var switchClass = function(element, oldClass, newClass) {
    var currentClass = element.getAttribute('class');
    if(!isEmpty(currentClass)) {
        element.setAttribute('class', currentClass.replace(oldClass, newClass));
    }
}

var hasLocalStorage = !isEmpty(typeof(Storage));

var hideDialog = function(dialogId) {
    var dialog = document.getElementById(dialogId);

    if(!isEmpty(dialog)) {
        if(contains(dialog.getAttribute('class'), 'shown', 'hidden')) {
            switchClass(dialog, 'shown', 'hidden');
        } else {
            addClass(dialog, 'hidden');
        }
    }

    removeClass(document.getElementById('html'), 'noScroll');
}

var showDialog = function(dialogId) {
    var dialog = document.getElementById(dialogId);

    if(!isEmpty(dialog)) {
        if(contains(dialog.getAttribute('class'), 'shown', 'hidden')) {
            switchClass(dialog, 'hidden', 'shown');
        } else {
            addClass(dialog, 'shown')
        }
    }

    addClass(document.getElementById('html'), 'noScroll');
}

var getValue = function(key) {
    if(hasLocalStorage) {
        return localStorage.getItem(key);
    }
}

var storeValue = function(key, value) {
    if(hasLocalStorage) {
        localStorage.setItem(key, value);
        getValue(key);
    }
}

var switchTheme = function(option) {
    var head = document.getElementById('head');

    var newStyle = document.createElement('link');
    newStyle.setAttribute('rel', 'stylesheet');
    newStyle.setAttribute('id', 'stylesheet');
    newStyle.setAttribute('type', 'text/css');
    newStyle.setAttribute('href', option === 'dark' ? 'main-dark.css' : 'main-light.css');

    var oldStyle = document.getElementById('stylesheet');

    if(newStyle.getAttribute('href') !== oldStyle.getAttribute('href')) {
        head.replaceChild(newStyle, oldStyle);
        storeValue('theme', option)
    }
}

window.onload = function() {
    if(!isEmpty(getValue('theme'))) {
        switchTheme(getValue('theme'));
    }
}

customElements.define('dialog', Dialog);

class Dialog extends HTMLElement {
    constructor() {
        super();


    }
}