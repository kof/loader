/**
 * Loader extension for dependencies management
 * 
 * @version 0.1 
 * @requires jquery.js, jquery.loader.js
 * @license Dual licensed under the MIT and GPL licenses.
 * @author Oleg Slobodskoi aka Kof (http://jsui.de)
 */

(function( global, $, namespace ){
    
    // all packages dependencies
var dependencies = {},
    // reference to the original loader constructor
    _Loader = global[namespace],
    // original prototype
    proto = _Loader.prototype,
    // all loaded files
    gloaded = {},
    // all registered modules
    registred = {},
    //timestamp = (new Date).getTime(),
    // defines if the code is surrounded with closure
    rclosureContent = /{(.*)}/;

/**
 * Load module described in dependencies json
 * @constructor
 * @param {string|Object} module
 * @param {Function|Object} [options] function or options object
 * @return {Function}
 */
function Loader( module, options ) {
    var fn = arguments.callee;
    // module is files object - use original loader
    if ( $.typeOf(module) !== 'string' ) {
        new _Loader(module);    
        return fn;        
    }
    
    isModule(module);
    
    // its a success callback
    $.typeOf(options) === 'function' && (options = {success: options});
        
        // merge original options with defaults if not already done
    var oSettings = $.extend(true, {}, fn.defaults, options);         
        
        // failed dependencies
    var errors = [],
        deps = parseDeps(module, oSettings),
        progress = {
            total: deps.count,
            loaded: 0
        };

    function oncomplete( urls, status, s ) {
        if ( s.js ) {
            // call or eval all modules synchron
            for ( var i = 0, url, parts; i < deps.js.length; ++i ) {
                url = deps.js[i];
                parts = $.regExp.file.exec( url );
                fn.exec( parts ? parts[2] : url );
            }
        }        
        
        // all dependencies are loaded
        if ( progress.loaded + errors.length == progress.total ) {
            !errors.length && proto.dispatch('success', [module, deps], oSettings);
            proto.dispatch('complete', [module, deps, errors.length ? 'error' : 'success'], oSettings);
        }        
    }
    
    function onerror( url, message, s) {
        errors.push(url);
        proto.dispatch('error', [url, message], oSettings);        
    }             
    
    function onprogress( url, _progress, s ) {
        ++progress.loaded;
        proto.dispatch('progress', [url, progress], oSettings);
    }
    
    // load js files separate from all other, because we can execute
    // after all dependencies are loaded, so no need to wait for other file types
    new _Loader($.extend({}, oSettings, {
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
    new _Loader($.extend({}, oSettings, {
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
    
    deps  = deps || {count: 0, hash: {}};
    
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
                    ++deps.count;    
                }
            }
        }
    }     
  
    return deps;
}

/**
 * Check if the module is defined, else throw an error
 * XXX throw an error or just call an error callback ?
 * @param {string} module
 */
function isModule( module ) {
    if ( !dependencies[module] ) 
        $.error( 'Module "' + module + '" does not exist.' );
    return true;    
}

/**
 * Convert string with char separated items to array
 * @param {string|Array|undefined} items
 * @param {string} [separator]
 * @return {Array}
 */
function split( items, separator ) {
    return $.typeOf(items) === 'string' ? items.split( separator || Loader.defaults.separator ) : ( items || [] );
}

$.extend(true, Loader, _Loader, {
    /**
     * Getter and setter for dependencies
     * @param {Object|undefined|string} deps
     * @return {Object}
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
     * @param {string|Object|undefined} module
     * @param {boolean} [deep] destroy also dependencies and dependencies dependencies
     * @return {Function}
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
                _Loader.remove( urls );    
                delete gloaded[module];
            }
        // it can ba an url, urls array or undefined
        } else {
            // its an url or urls array           
            _Loader.remove(module);
            // if undefined - remove all loaded
            !module && (gloaded = {});
        }
            
        return this;    
    },
    /**
     * Execute closure with a module or evaluate in global context 
     * @param {string} module
     * @return {Function}
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
global[namespace] = Loader;


/**
 * This is a second global namespace, I know,
 * the purpose is to make the main loader namespace portable, 
 * without to use jsonp (because using generated namespace will avoid caching)
 * @param {string} id
 * @param {Function} fn
 * @param {boolean} globalEval if true module will be converted toString and evaluated in the global context without module closure
 */
global.___registerLoaderModule___ = function registerModule( id, fn, globalEval ) {
    globalEval && (fn.globalEval = globalEval);
    registred[id] = fn;
};

})( this, $, 'loader' );