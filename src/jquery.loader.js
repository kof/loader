/**
 * jquery plugin for lazyload of js, css and images
 *
 * @version 0.6
 * @author Oleg Slobodskoi aka Kof
 * @website jsui.de
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
    modules = {};

/**
 * Load dependencies using config object or 
 * module name, that was defined in loader.def() before
 * @constructor loader
 * @param {Object, String} settings
 */    
function loader( settings ) {
    if ( !(this instanceof loader) ) {
        new loader(settings);
        return loader;        
    }
        
    var self = this,
        s = this.settings = $.extend({}, loader.defaults, settings),
        progress = {
            total: 0,
            loaded: 0    
        },
        errors = [],
        loaded = [];
    
    !s.context && (s.context = loader); 
    
    dispatch('start', [], s);
    
    // load all files asychron
    $.each('js css img'.split(' '), function load(i, type) {
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
                updateStatus.call(elem, url, 'error', 'timeout');
            }, s.timeout);
        }
    });
    
}  

loader.prototype = {
    js: function js( url, callback ) {
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
                onerror: function onerror( e ){
                    callback && callback.call(this, url, 'error', e);    
                }
            })
        );
    },
    
    css: function css( url, callback ) {
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
                onerror: function( e ){
                    callback && callback.call(this, url, 'error', e);    
                }
                
            })
        );    
        
        // browser detection is bad, I know, but there is no other way to find out if stylesheet is loaded
        // https://bugzilla.mozilla.org/show_bug.cgi?id=563176
        // opera has done a good job here, it fires onload callback
        // ie fires onreadystatechange - better then nothing
        // all other browsers have no callbacks, so we have to hack this and try to access 
        // link.sheet.cssRules property, which is accessible after stylesheet is loaded
        if ( !$.browser.msie && !$.browser.opera ) {
            function linkload(){
                try {
                    link.sheet.cssRules;
                } catch(e) {
                    return setTimeout(linkload, 50);
                }
                onload.call(link);
            }
    
            var parts = rurl.exec( url ),
                remote = parts && (parts[1] && parts[1] !== location.protocol || parts[2] !== location.host);
    
            // if the host of the url is different then window.location, firefox refuses access 
            // to the cssRules property, so no way to check the load - fire onload immediately
            $.browser.mozilla && remote ? onload.call(link) : linkload();
        }   
    
        return link;
    },
    
    img: function img( url, callback ) {
        var img = new Image;
        img.onload = function onload() {
            callback.call(this, url, 'success');    
        };
        img.onerror = function onerror( e ) {
            callback.call(this, url, 'error', e);    
        };
        img.src = url;
        return img;
    }
};    



/**
 * Helper function to call all pending callbacks,
 * and mark loaded urls, this has always element context 
 * @param {String} url
 * @param {String} status
 */
function updateStatus( url, status, error ) {
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
 * @param {String} url
 * @param {Boolean} domCheck
 * @param {String} type
 * @return {Boolean}
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
 * @param {String} name
 * @return {String} type possible types: js, css, img, text, module
 */
function getType( url ) {
    return modules[url] ? 'module' : ( fileTypes[ url.substr(url.lastIndexOf('.')+1) ] || 'text' );
}

/**
 * Dispatch events and callbacks
 * @param {String} name
 * @param {Object} context
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

$.extend(loader, {
    // setter and getter for defaults
    setup: function( defaults ) {
        if ( defaults ) {
            $.extend(true, loader.defaults, defaults);
            return this;        
        } else 
            return this.defaults;
    },
    
    // remove all scripts and stylesheets and clean gloaded object
    destroy: function( url ) {
        var remove = {};
        // name is a specific url
        if ( typeof url == 'string' ) {
            remove[url] = gloaded[url];
        } else if ( $.isArray(url) ) {
            for ( var i=0; i <= url.length; ++i ) {
                remove[url[i]] = gloaded[url[i]];
            }
        } else  
            $.extend(remove, gloaded);
        
        for ( var url in remove ) {
            var type = getType(url);
            if ( type == 'js' || type == 'css' )
                gloaded[url].parentNode.removeChild(gloaded[url]);
            delete gloaded[url];
        }
        return this;    
    },
    
    // getter and setter for dependencies definitions
    def: function( d, callback ) {
        
        return this;
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

// provide public namespaces
$[plugin] = loader;
    
})(jQuery, document, 'loader');
