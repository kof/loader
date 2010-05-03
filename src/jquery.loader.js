/**
 * jQuery plugin for lazyload of js, css and images
 *
 * @version 0.6
 * @author Oleg Slobodskoi aka Kof http://jsui.de
 */

(function($, document, plugin){
    
var head = document.getElementsByTagName("head")[0] || document.documentElement,
    rurl = /^(\w+:)?\/\/([^\/?#]+)/,
    // absolute url - contains http://
    rabsurl = /http:\/\//,
    fileTypes = {
        js: 'js',
        css: 'css',
        jpg: 'img', png: 'img', gif: 'img', tiff: 'img', raw: 'img', bmp: 'img'
    },
    timestamp = (new Date).getTime(),
    // global loaded files
    gloaded = {},
    // pending requests
    pending = {length: 0},
    // predefined modules
    modules = {},
    loadedModules = {};


/**
 * Convenience function for instantiation
 * @param {string|Object} load
 * @param {Object} callback
 */   
function loader( load, callback ) {
    // settings is module name
    if ( typeof load == 'string' ) {
        return loadModule(load, callback);    
    } else {
        new init(load);
        return loader;        
    }
}  

/**
 * Load dependencies using config object or 
 * module name, that was defined in loader.def() before
 * @constructor loader
 * @param {Object|string} settings
 */ 
function init( settings ) {

    var self = this,
        s = this.settings = $.extend(true, {}, loader.defaults, settings),
        progress = {
            total: 0,
            loaded: 0    
        },
        errors = [],
        loaded = [];
    
    !s.context && (s.context = loader); 
    
    dispatch('start', [], s);
    
    // load all files asychron
    $.each('js css img'.split(' '), function load(index, type) {
        if ( !s[type] ) return;
        
        var urls = typeof s[type] == 'string' ? [s[type]] : s[type];
        
        for ( var i=0; i < urls.length; ++i ) {
            ++progress.total;
            // fire all callbacks and events
            function complete( url, status, error ) {
                if ( status === 'success' ) {
                    ++progress.loaded;
                    loaded.push(url);
                    dispatch('progress', [url, progress], s);
                    if ( progress.loaded == progress.total )
                        dispatch('success', [loaded], s);
                } else {
                    // remove dom node if possible
                    this.parentNode && this.parentNode.removeChild(this);
                    errors.push(url);
                    dispatch('error', [url, error], s);
                }
                
                if ( progress.loaded + errors.length == progress.total )
                    dispatch('complete', [loaded.concat(errors), status], s);
            }
            var url = urls[i];
            // only use base + root path if the url is not absolute
            if ( !rabsurl.test(url) )
                url = s.base + s.root[type] + url;                
            
            if ( haveToLoad(url, s.domCheck, type, complete) ) {
                // pending[url] is a callbacks array
                pending[url] = [complete];
                pending.length++;
                var elem = self[type](url, updateStatus);
            }
            
            s.timeout && setTimeout(function(){
                updateStatus.call(elem, url, 'error');
            }, s.timeout);
        }
    });    
};

init.prototype = {
    js: function( url, callback ) {
        var done = false;
        // onload handler
        function onload() {
            if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                done = true;
                // Handle memory leak in IE
                this.onload = this.onreadystatechange = null;
                callback && callback.call(this, url, 'success');
            }
        }
    
        return head.appendChild(
            $.extend(document.createElement('script'), {
                src: url,
                type: 'text/javascript',
                charset: this.settings.charset,
                onload: onload,
                onreadystatechange: onload,
                // currently only mozilla
                onerror: function onerror(){
                    callback && callback.call(this, url, 'error');    
                }
            })
        );
    },
    
    css: function( url, callback ) {
        var done = false;
        // onload handler
        function onload() {
            if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                done = true;
                // Handle memory leak in IE
                this.onload = this.onreadystatechange = null;
                callback && callback.call(this, url, 'success');
            }
        }
        
        
        var link = head.appendChild(
            $.extend(document.createElement('link'), {
                href: url,
                rel: 'stylesheet',
                media: 'all',
                type: 'text/css',
                charset: this.settings.charset,
                onload: onload,
                onreadystatechange: onload,
                // currently nobody supports this, but probably someday
                onerror: function(){
                    callback && callback.call(this, url, 'error');    
                }
                
            })
        );    
        
        // browser detection is bad, I know, but there is no other way to find out if stylesheet is loaded
        // https://bugzilla.mozilla.org/show_bug.cgi?id=185236
        // opera has done a good job here, it fires onload callback
        // ie fires onreadystatechange - better then nothing
        // all other browsers have no callbacks, so we have to hack this and try to access 
        // link.sheet.cssRules property, which is accessible after stylesheet is loaded
        // https://bugzilla.mozilla.org/show_bug.cgi?id=346945
        if ( !$.browser.msie && !$.browser.opera ) {
            function linkload(){
                try {
                    link.sheet.cssRules && onload.call(link);
                } catch(e) {
                    return setTimeout(linkload, 50);
                }
            }
    
            var parts = rurl.exec( url ),
                remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);
    
            // if the host of the url is different then window.location, firefox refuses access 
            // to the cssRules property, so no way to check the load - fire onload immediately
            $.browser.mozilla && remote ? onload.call(link) : linkload();
        }   
    
        return link;
    },
    
    img: function( url, callback ) {
        var img = new Image;
        img.onload = function onload() {
            callback.call(this, url, 'success');    
        };
        img.onerror = function onerror() {
            callback.call(this, url, 'error');    
        };
        img.src = url;
        return img;
    }
};    



/**
 * Helper function to call all pending callbacks,
 * and mark loaded urls, this has always element context 
 * @param {string} url
 * @param {string} status
 */
function updateStatus( url, status ) {
    if ( pending[url] ) {
        for( var i=0; i < pending[url].length; ++i) {
            pending[url][i].apply(this, arguments);    
        }
        delete pending[url];
        --pending.length;
    }
    if ( status == 'success' && !gloaded[url] )
        gloaded[url] = this;

    return url;    
}
    
/**
 * Helper function for the check if the file is already loaded,
 * internal usage only
 * @param {string} url
 * @param {boolean} domCheck
 * @param {string} type
 * @return {boolean}
 */    
function haveToLoad( url, domCheck, type, complete ) {
    // file is already successfull loaded
    if ( gloaded[url] ) {
        updateStatus.call(gloaded[url], url, 'success');
        return false;
    // this file is loading                
    } else if (pending[url]) {
        // just add a callback
        pending[url].push(complete);
        return false;
    // if domCheck is enabled and type is js or css 
    } else if (domCheck && (type === 'js' || type === 'css')) {
        // try to find link or script in the dom    
        var $elem = $(type === 'js' ? 'script[src*="' + url + '"]' : 'link[href*="' + url + '"]');
        if ( $elem.length ) {
            pending[url] = [complete];
            updateStatus.call($elem[0], url, 'success');
            return false;    
        }
    }
    return true;         
}
  
/**
 * Detect type using url,
 * @param {string} url
 * @return {string} type possible types: js, css, img, text, module
 */
function getType( url ) {
    return modules[url] ? 'module' : ( fileTypes[ url.substr(url.lastIndexOf('.')+1) ] || 'text' );
}

/**
 * Dispatch events and callbacks
 * @param {string} type
 * @param {Array} args
 * @param {Object} s
 */
function dispatch( type, args, s ) {
    // always add settings to the arguments array
    args.push(s);
    // dispatch callback
    s[type] && s[type].apply(s.context, args);
    // trigger global event
    s.global && $.event.trigger(s.eventPrefix + type, args);        
}


/**
 * Load module described in dependencies json
 * @param {string} module
 * @param {Function|Object} callback function or setting object
 */
function loadModule( module, callback ) {
    if ( !modules[module] ) $.error('Module "' + module + '" does not exist.');
    
    var options = typeof callback == 'object' ? callback : {success: callback},
        d = modules[module].depends;
    
    if ( d ) {
        typeof d == 'string' && (d = [d]);
        for ( var i=0; i < d.length; ++i ) {
            if ( loadedModules[d[i]] ) {
                loadModule(module, options);
            } else {
                loadModule(d[i], function(){
                    loadedModules[d[i]] = true;
                    new init($.extend(options, modules[module]));
                });                
            }
        }
    } else {
        new init($.extend(options, modules[module]));
    }
    
    return loader;
}


$.extend(loader, {
    init: init,
    /**
     * Getter and setter for defaults
     * @param {Object|Undefined} defaults
     */
    setup: function( defaults ) {
        if ( defaults ) {
            $.extend(true, loader.defaults, defaults);
            return this;        
        } else 
            return this.defaults;
    },
    /**
     * Destroy loaded - clean dom and gloaded object
     * @param {string|Array|Undefined} name
     */
    destroy: function( name ) {
        // urls list to remove
        var remove = {};
        // remove only one file
        if ( typeof name == 'string' ) {
            remove[name] = gloaded[name];
        // remove an array of modules    
        } else if ( $.isArray(name) ) {
            for ( var i=0; i <= name.length; ++i ) {
                remove[name[i]] = gloaded[name[i]];
            }
        // remove all modules    
        } else  
            $.extend(remove, gloaded);
        
        for ( var url in remove ) {
            var type = getType(url);
            ( type == 'js' || type == 'css' ) && gloaded[url].parentNode 
            && gloaded[url].parentNode.removeChild(gloaded[url]);
            delete gloaded[url];
        }
        return this;    
    },
    /**
     * Getter and setter for modules dependencies definitions
     * @param {Object|Undefined} m
     */
    def: function( m ) {
        if ( m ) {
            $.extend(modules, m);
            return this;
        } else
            return modules[m] || modules;
    },
    /**
     * Getter and setter for global loaded files
     * @param {string|Array|Undefined} urls
     */
    loaded: function( urls ) {
        if ( urls ) {
            typeof urls == 'string' ? (gloaded[urls] = true) : $.extend(gloaded, urls);  
            return this;  
        } else
            return gloaded;
    },
    // default settings
    defaults: {
        charset: 'UTF-8',
        js: null, css: null, img: null, text: null,
        // base url bath for all requests
        base: '',
        // root path for each file type, will be added to the base path
        root: {js: '', css: '', img: ''},
        timeout: 30000,
        // check in the dom if the css or script is loaded
        domCheck: false,
        // trigger global events
        global: true,
        context: null,
        // callbacks
        start: null,
        success: null,
        error: null,
        complete: null,
        progress: null,
        eventPrefix: plugin
    }    
});

// provide public namespace
$[plugin] = loader;
    
})(jQuery, document, 'loader');
