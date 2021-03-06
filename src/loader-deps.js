/**
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