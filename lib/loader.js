/**
 * Load sync or async javascript, css, images files.
 * 
 * @module loader
 * @version 0.0.2
 * @license Dual licensed under the MIT and GPL licenses.
 * @author Oleg Slobodskoi aka Kof (http://github.com/kof/loader)
 */

;(function( global, window, document, undefined ){
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
};/**
 * @module loader
 * 
 */
var root = $('head')[0] || document.documentElement,
    slice = Array.prototype.slice,
    // global loaded files
    gloaded = {},
    // pending requests
    pending = {__length: 0};
    
    
/**
 * Load files 
 * @class Loader
 * @param {object} options
 * @return {function} loader
 */   
function Loader( options ) {
    var constr = arguments.callee;
    
    if ( !(this instanceof constr) ) {
        new constr( options );
        // enable chaining
        return constr;        
    }
    
    var self = this,
        s = this.settings = $.extend(true, {}, constr.defaults, options),
        files = toArray(s, s.types, s.separator),
        loaded = [],
        errors = [],
        progress = {
            total: files.length,
            loaded: 0    
        };
    
    this.dispatch('start');
    
    // load all files asychron
    $.each(files, function( i, file ){
        
        // only use base path if the url is not absolute
        if ( !$.regExp.url.test(file.url) ) {
            file.url = s.base + s.root[file.type] + file.url;                
        }
        
        // add some query params
        if ( s.query ) {
            if ( file.url.charAt( file.url.length-1 ) !== '?' ) {
                file.url += '?';
            }

            file.url += s.query;                 
        }                

        if ( haveToLoad(file.url, s.domCheck, file.type, complete) ) { 
            // pending[url] is a callbacks array
            pending[file.url] = [complete];
            ++pending.__length;
            if ( s.timeout ) {
                pending[file.url].timeout = setTimeout(function(){
                    updateStatus.call(elem, file.url, 'error');
                }, s.timeout);
            }

            var elem = self[file.type](file.url, updateStatus);
        }
    });
    
    // fire all callbacks
    function complete( url, status ) {
        if (status === 'success') {
            ++progress.loaded;
            loaded.push(url);
            self.dispatch('progress', url, progress);
            if (progress.loaded == progress.total) 
                self.dispatch('success', loaded);
        } else {
            errors.push(url);
            self.dispatch('error', url, 'Unable to load resources.');
        }

        if ( progress.loaded + errors.length == progress.total ){
            self.dispatch('complete', loaded.concat(errors), errors.length ? 'error' : 'success');
        }
    }   
}  

// define prototype for constructor
// all methods are for internal use
Loader.prototype = {
    /**
     * Load script
     * @method js
     * @param {string} url
     * @param {function} callback
     * @return {object}
     * @private
     */     
    js: function( url, callback ) {
        var script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.charset = this.settings.charset;
        this.addHandler(script, url, callback);
        root.insertBefore(script, root.firstChild);
        return script;
    },
    /**
     * Load stylesheet
     * 
     * @metod css
     * @param {string} url
     * @param {function} callback
     * @return {object} link
     * @private
     */    
    css: function( url, callback ) {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.media = 'all';
        link.href = url;
        link.className = this.settings.className;
        var onload = this.addHandler(link, url, callback);

        // browser detection is bad, I know, but there is no other way to find out if stylesheet is loaded
        // https://bugzilla.mozilla.org/show_bug.cgi?id=185236
        // opera has done a good job here, it fires onload callback
        // ie fires onreadystatechange - better then nothing
        // all other browsers have no callbacks, so we have to hack this and try to access 
        // link.sheet.cssRules property, which is accessible after stylesheet is loaded, 
        // except of mozilla by crossdomain requests  
        // https://bugzilla.mozilla.org/show_bug.cgi?id=346945
        if ( !$.browser.msie && !$.browser.opera ) {
            function linkload() {
                try {
                    var rules = link.sheet.cssRules;
                } catch(e) {
                    return setTimeout(linkload, 50);
                }
                onload.call(link);
            }
    
            var parts = $.regExp.url.exec( url ),
                remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);
    
            // mozilla and crossdomain request - fire onload immediately
            $.browser.mozilla && remote ? onload.call(link) : linkload();
        }   
    
        root.appendChild(link);
        return link;    
    },
    /**
     * Load image
     * @method css
     * @param {string} url
     * @param {function} callback
     * @return {object} img
     * @private
     */
    img: function( url, callback ) {
        var image = new Image;
        this.addHandler(image, url, callback);
        image.src = url;
        return image;
    },
    /**
     * Dispatch callbacks
     * @method dispatch
     * @param {string} type
     * @param {array} args
     * @param {object} s
     * @return {string} type
     * @private
     */
    dispatch: function( type /*, arg1, arg2, ... */ ) {
        var s = this.settings,
            args = slice.call(arguments, 1);
        // always add settings to the arguments array
        args.push(s);
        // dispatch callback
        s[type] && s[type].apply(s.context, args);
        return type;        
    },
    /**
     * Attach onload and onerror handler
     * @method addHandler
     * @param {object} elem dom element
     * @param {string} url
     * @param {function} callback
     * @return {function} onload
     * @private
     */
    addHandler: function( elem, url, callback ) {
        var done = false;
        function onload() {
            if ( !done && (!elem.readyState || elem.readyState === "loaded" || elem.readyState === "complete") ) {
                done = true;
                // Handle memory leak in IE
                elem.onload = elem.onreadystatechange = elem.onerror = null;
                elem.nodeName === 'SCRIPT' && removeNode(elem);
                callback && callback.call(elem, url, 'success');
            }
        }
        // onerror handler
        function onerror(){
            callback && callback.call(elem, url, 'error');    
        }
        // script tags - all
        // link tags - all except of mozilla if crossdomain
        // image - all 
        elem.onload = elem.onreadystatechange = onload; 
        // script tags - mozilla only
        // link tags - nobody, but perhaps someday :)
        // image - all browser
        elem.onerror = onerror; 
        return onload;
    }
       
};    

/**
 * Helper function to call all pending callbacks,
 * and mark loaded urls, this has always element context 
 * @param {string} url
 * @param {string} status
 * @private
 */
function updateStatus( url, status ) {
    if ( pending[url] ) {
        for( var i=0; i < pending[url].length; ++i) {
            pending[url][i].apply(this, arguments);    
        }
        clearTimeout(pending[url].timeout);
        delete pending[url];
        --pending.__length;
    }
    
    status === 'success' ? (gloaded[url] = this) : removeNode(this); 

    return url;    
}
    
/**
 * Helper function for the check if the file is already loaded,
 * for internal usage only
 * @param {string} url
 * @param {boolean} domCheck
 * @param {string} type
 * @return {boolean}
 * @private
 */    
function haveToLoad( url, domCheck, type, complete ) {
    // file is already successfull loaded
    if ( gloaded[url] ) {
        updateStatus.call(gloaded[url], url, 'success');
        return false;
    // this file is loading                
    } else if ( pending[url] ) {
        // just add a callback
        pending[url].push( complete );
        return false;
    // if domCheck is enabled and type is js or css 
    } else if ( domCheck && (type === 'js' || type === 'css') ) {
        // try to find link or script in the dom
        var attr = type === 'js' ? 'src' : 'href',
            tag = type === 'js' ? 'script' : 'link',
            elems = $(tag),
            i;
            
        if ( elems.length ) {
            for ( i = 0; i < elems.length; ++i ) {
                if ( elems[i][attr].indexOf(url) >= 0 ) {
                    pending[url] = [complete];
                    updateStatus.call( elems[i], url, 'success' );
                    return false;                   
                }
            }
        }            
    }
    
    return true;         
}

/**
 * Push all urls from json to a flat array
 * @param {object} obj
 * @param {array} types
 * @param {string} separator
 * @return {array} ret
 * @private
 */   
 function toArray( obj, types, separator ) {
    var ret = [], urls;
    for ( var i=0; i < types.length; ++i ) {
        if ( urls = obj[types[i]] ) {
            // multiple urls in one string
            $.typeOf(urls) === 'string' && (urls = urls.split(separator));
            for ( var k = 0; k < urls.length; ++k ) {
                ret.push({url: urls[k], type: types[i]});
            }
        }
    }
    
    return ret;
}

/**
 * Remove dom element
 * @param {object} elem dom node
 * @private
 */
function removeNode( elem ) {
   elem && elem.parentNode && elem.parentNode.removeChild(elem); 
}

/**
 * Remove loaded element and url from the hash 
 * @param {string} url
 * @private
 */
function removeLoaded( url ) {
    removeNode(gloaded[url]);
    delete gloaded[url];            
}



// public api
$.extend(Loader, {
    /**
     * Getter and setter for defaults
     * @method setup
     * @param {object|undefined} defaults
     * @return {object|function}
     */
    setup: function( defaults ) {
        if ( defaults ) {
            $.extend(true, this.defaults, defaults);
            return this;        
        } else 
            return this.defaults;
    },
    /**
     * Remove loaded - clean dom and gloaded object
     * @method remove
     * @param {string|array|undefined} name
     * @return {function}
     */
    remove: function( name ) {
        // handle 3 cases - one url, array of urls or all loaded files
        var type = $.typeOf(name);
        if ( type === 'string' ) {
            removeLoaded(name);
        } else if ( type === 'array' ) {
            for (var i = 0; i < name.length; ++i )
                removeLoaded(name[i]);
        // remove all    
        } else {
            for ( var url in gloaded )
                removeLoaded(url);               
        }
        
        return this;    
    },
    /**
     * Getter and setter for global loaded files object to avoid double loading.
     * Can be used if you have already loaded some files before not using loader,
     * and there is no dom element contained such url or you want to avoid domCheck
     * @method loaded
     * @param {string|object|undefined} name
     * @param {string|object} value
     * @return {function|object}
     */
    loaded: function( name, value ) {
        // its a getter
        if ( !value ) {
            return name ? gloaded[name] : gloaded;
        }
        
        // its a setter
        if ( name && value ) {
            var type = $.typeOf(name);
            if ( type === 'string' ) {
                gloaded[name] = value;
            } else if ( type === 'object' ) {
                $.extend(gloaded, name);    
            }                
            return this;  
        }
    },
    // default settings
    defaults: {
        // only for scripts
        charset: 'UTF-8',
        // arrays/lists of files to load
        js: null, css: null, img: null, text: null,
        // supported file types
        types: ['js', 'css', 'img', 'text'],
        // base url bath for all requests
        base: '',
        // root path for each file type, will be added to the base path
        root: {js: '', css: '', img: '', text: ''},
        // add some query params to each url for e.g. cache key
        query: null,
        // separator for files or modules lists, when used instead of array
        separator: ' ',
        // will be added to each link element
        className: 'loader',
        // if timeout and request is still in pending list, error callback will be called
        timeout: 1000,
        // check in the dom if the css or script is loaded
        domCheck: false,
        // context for callbacks
        context: window,
        'import': false,
        // callbacks
        start: null,
        success: null,
        error: null,
        complete: null,
        progress: null
    }    
});

// provide public namespace
global.loader = Loader;/**
 * Loader extension for dependencies management
 */

var // all packages dependencies
    dependencies = {},
    // reference to the original loader constructor
    Loader = global.loader,
    dispatch = Loader.prototype.dispatch,
    // all loaded files
    gloaded = {},
    // all registered modules
    registred = {},
    //timestamp = (new Date).getTime(),
    // defines if the code is surrounded with closure
    rclosureContent = /{(.*)}/;

/**
 * Load module described in dependencies json
 * @param {string|object} module
 * @param {function|object} [options] function or options object
 * @return {function}
 */
function loader( module, options ) {
    var fn = arguments.callee;
    // module is files object - use original loader
    if ( $.typeOf(module) !== 'string' ) {
        new Loader(module);    
        return fn;        
    }
    
    isModule(module);
    
    // its a success callback
    $.typeOf(options) === 'function' && (options = {success: options});
        
        // merge original options with defaults if not already done
    var oSettings = $.extend(true, {}, fn.defaults, options),
        context = {settings: oSettings},
        deps = parseDeps(module, oSettings),
        // failed dependencies
        errors = [],
        progress = {
            total: deps.length,
            loaded: 0
        };

    function oncomplete( urls, status, s ) {
        if ( s.js ) {
            // call or eval all modules synchron
            for ( var i = 0, url, parts; i < deps.js.length; ++i ) {
                url = deps.js[i];
                parts = $.regExp.file.exec(url);
                fn.exec(parts ? parts[2] : url);
            }
        }        
        
        // all dependencies are loaded
        if ( progress.loaded + errors.length == progress.total ) {
            !errors.length && dispatch.call(context, 'success', module, deps);
            dispatch.call(context, 'complete', module, deps, errors.length ? 'error' : 'success');
        }        
    }
    
    function onerror( url, message, s) {
        errors.push(url);
        dispatch.call(context, 'error', url, message);        
    }             
    
    function onprogress( url, _progress, s ) {
        ++progress.loaded;
        dispatch.call(context, 'progress', url, progress);
    }
    
    // load js files separate from all other, because we can execute
    // after all dependencies are loaded, so no need to wait for other file types
    new Loader($.extend({}, oSettings, {
        success: null,
        start: null,
        css: null,
        img: null,
        text: null,
        js: deps.js,
        progress: onprogress,
        complete: oncomplete,
        error: onerror
    }));
    
    // load css, img and text
    new Loader($.extend({}, oSettings, {
        success: null,
        start: null,
        js: null,
        css: deps.css,
        img: deps.img,
        text: deps.text,
        progress: onprogress,
        complete: oncomplete,
        error: onerror
    }));    
    
    return fn;
}    


function parseDeps( module, s, deps) {
    isModule(module);
    
    deps  = deps || {length: 0, hash: {}};
    
    var i, files, type,
        m = dependencies[module];

    // add all dependencies
    var depends = split( m.depends );
    if ( depends.length ) {
        for ( i=0; i<depends.length; ++i ) {
            parseDeps(depends[i], s, deps);
        }            
    }    

    // parse all files for current module
    for ( i=0; i < s.types.length; ++i ) {
        type = s.types[i];
        files = m[type];
        if ( files ) {
            files = split( files );
            !deps[type] && ( deps[type] = [] );
            for ( var k=0, file; k < files.length; ++k ) {
                // add module root path to each file url
                file = m.root && m.root[type] ? m.root[type] + files[k] : files[k];
                // avoid dublicate files
                if ( !deps.hash[file] ) {
                    deps[type].push( file );
                    deps.hash[file] = true;
                    ++deps.length;    
                }
            }
        }
    }     
  
    return deps;
}

/**
 * Check if the module is defined, else throw an error
 * XXX throw an error or just call an error callback ?
 * @method isModule
 * @param {string} module
 * @private
 */
function isModule( module ) {
    if ( !dependencies[module] ) 
        $.error( 'Module "' + module + '" does not exist.' );
    return true;    
}

/**
 * Convert string with char separated items to array
 * @param {string|array|undefined} items
 * @param {string} [separator]
 * @return {array}
 * @private
 */
function split( items, separator ) {
    return $.typeOf(items) === 'string' ? items.split( separator || loader.defaults.separator ) : ( items || [] );
}

$.extend(loader, Loader, {
    /**
     * Getter and setter for dependencies
     * @method deps
     * @param {object|undefined|string} deps
     * @return {object}
     */
    deps: function( deps ) {
        if ( deps ) {
            $.extend( dependencies, deps );
            return this;
        } else
            return dependencies[deps] || dependencies;        
    },
    /**
     * Remove loaded dependencies
     * @method remove
     * @param {string|object|undefined} module
     * @param {boolean} deep destroy also dependencies and dependencies dependencies
     * @return {function}
     */
    remove: function( module, deep ) {
        var self = this;
        // its a module
        if ( dependencies[module] ) {
            // remove all dependencies dependencies
            if ( gloaded[module] && deep ) {
                var urls = [];
                $.each(dependencies[module], function( type, items ){
                    items = split(items);
                    for ( var i=0; i < items.length; ++i ) {
                        type == 'depends' && deep ? self.remove(items[i], true) : urls.push(items[i]);
                    }
                });
                Loader.remove(urls);    
                delete gloaded[module];
            }
        // it can ba an url, urls array or undefined
        } else {
            // its an url or urls array           
            Loader.remove(module);
            // if undefined - remove all loaded
            !module && (gloaded = {});
        }
            
        return this;    
    },
    /**
     * Execute closure with a module or evaluate in global context
     * @method exec 
     * @param {string} fileName
     * @return {function}
     */
    exec: function( fileName ) {
        if ( !registred[fileName] ) return this;
        // if globalEval is set, we have to execute the code in global context,
        // because the code contains private methods and variables
        if ( registred[fileName].globalEval ) {
            var parts = rclosureContent.exec( registred[fileName].toString().replace(/\n/g, '') );
            // code is surrounded with closure, so we have to eval it in global context 
            if ( parts && parts[1] ) {
                // surround the code with try and catch, to be able to name the file name in case of errors 
                parts[1] = 'try{' + parts[1] + '} catch(e) {\
                throw e.name + ": " + e.message + ". File name: " + "' + url + '" + ". Because of globalEval is the line number undefined.";\
                }';                            
                $.globalEval( parts[1] );   
            }
        } else
            // just call the closure
            registred[fileName]();        
        return this;    
    }
});

// expose new loader function
global.loader = loader;
/**
 * This is a second global namespace, I know,
 * the purpose is to make the main loader namespace portable, 
 * without to use jsonp (because using generated namespace will avoid caching)
 * @module registerModule
 * @param {string} id
 * @param {function} fn
 * @param {boolean} globalEval if true module will be converted toString and evaluated in the global context without module closure
 */
global.___registerLoaderModule___ = function registerModule( id, fn, globalEval ) {
    globalEval && (fn.globalEval = globalEval);
    registred[id] = fn;
};
})( this, window, window.document );