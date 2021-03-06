/*!
 * Utils
 * Some of them borrowed by jQuery
 */
var root = $('head')[0] || document.documentElement,
    slice = Array.prototype.slice, 
	toString = Object.prototype.toString,
    timestamp = (new Date).getTime();

function $( selector, context ) {
    var pr = selector.substr(0, 1),
        ret;
     
    !context && (context = document);
    // handle id
    if ( pr == '#' ) {
        ret = context.getElementById(selector.substr(1));
    // handle class    
    } else if ( pr == '.' ) {
        // XXX
    // handle tag name    
    } else {
        ret = context.getElementsByTagName(selector);
    }
    return ret;    
}  

    
$.extend = function( deep /*, obj, obj, ...*/ ) {
    // take first argument, if its not a boolean
    var args = arguments,
        firstArg = typeof deep == 'boolean' ? 1 : 0,
        target = args[firstArg];
    
    for ( var i = firstArg; i < args.length; ++i ) {
        for ( var key in args[i] ) {
            // if deep extending and both of keys are objects
            if ( deep === true && 
                 target[key] && 
                 $.typeOf(target[key]) === 'object' && 
                 $.typeOf(args[i][key]) === 'object' &&
                 // its not a window or node
                 !args[i][key].nodeType && 
                 !args[i][key].setInterval 
            ) {
                args.callee(deep, target[key], args[i][key]);    
            } else
                target[key] = args[i][key];
        }            
    }        
    return target;
};

$.each = function( data, callback ) {
    if ( $.typeOf(data) === 'object' ) {
        for ( var key in data ) {
            if ( callback(key, data[key]) === false )
                break;    
        }
    } else {
        for ( var i=0; i<data.length; ++i ) {
            if ( callback(i, data[i]) === false )
                break;    
        }
    }
};

$.typeOf = (function(){
    var types = {
        '[object Array]': 'array',
        '[object Object]': 'object',
        '[object Function]': 'function',
        '[object Boolean]': 'boolean',
        '[object String]': 'string'
    };
    return function( any ) {
        return types[toString.call(any)] || typeof any;        
    };
})(); 

$.browser = (function(){
    var ua = navigator.userAgent.toLowerCase(),
        match = /(webkit)[ \/]([\w.]+)/.exec( ua ) ||
        /(opera)(?:.*version)?[ \/]([\w.]+)/.exec( ua ) ||
        /(msie) ([\w.]+)/.exec( ua ) ||
        !/compatible/.test( ua ) && /(mozilla)(?:.*? rv:([\w.]+))?/.exec( ua ) ||
        [],
        ret = {
            version: match[2] || '0'
        };

    ret[match[1]] = true;
    return ret;
})();

$.support = {};

// script eval
(function(){
    var script = document.createElement('script'),
        id = 'script' + timestamp++;
    script.type = 'text/javascript';
    try {
        script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
    } catch(e) {}

    root.insertBefore( script, root.firstChild );

    // Make sure that the execution of code works by injecting a script
    // tag with appendChild/createTextNode
    // (IE doesn't support this, fails, and uses .text instead)
    if ( global[ id ] ) {
        $.support.scriptEval = true;
        delete global[ id ];
    }

    root.removeChild( script );
})();

$.error = function( msg ) {
    throw msg;    
};

$.inArray = function( elem, array ) {
    if ( array.indexOf )
        return array.indexOf( elem );

    for ( var i = 0, length = array.length; i < length; i++ )
        if ( array[ i ] === elem )
            return i;
            
    return -1;
};    

$.regExp = {
    // returns null if no protocoll
    // http://www.google.de - ["http://www.google.de", "http:", "www.google.de"] 
    url: /^(\w+:)?\/\/([^\/?#]+)/,
    // /test/lib.js - ["/test/lib.js", "/test/", "lib.js"]
    file: /^(.*\/)(.*)/,
    // Check if a string has a non-whitespace character in it
    notwhite: /\S/
};



$.globalEval = function( data ) {
    if ( data && $.regExp.notwhite.test(data) ) {
        var script = document.createElement('script');
        script.type = 'text/javascript';

        if ( $.support.scriptEval ) {
            script.appendChild( document.createTextNode( data ) );
        } else {
            script.text = data;
        }

        // Use insertBefore instead of appendChild to circumvent an IE6 bug.
        root.insertBefore( script, root.firstChild );
        root.removeChild( script );
    }
};