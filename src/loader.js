/**
 * Require and import js, css, images or text/templates
 * 
 * @todo 
 * - beim laden von packages module zum className hinzufügen
 * - import 
 * 
 * @version 0.1
 * @license Dual licensed under the MIT and GPL licenses.
 * @author Oleg Slobodskoi aka Kof (http://jsui.de)
 */
(function(global, document, $, namespace) {
    
var head = $('head')[0] || document.documentElement,
    // global loaded files
    gloaded = {},
    // pending requests
    pending = {__length: 0};
    
    
/**
 * Load files 
 * @constructor
 * @param {Object} options
 * @return {Function} loader
 */   
function loader( options ) {
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
    
    !s.context && (s.context = constr); 
    
    this.dispatch('start', [], s);
    
    // load all files asychron
    for ( var i=0, file; i < files.length; ++i ) {
        file = files[i];
        // only use base path if the url is not absolute
        if ( !$.regExp.url.test(file.url) )
            file.url = s.base + file.url;                

        if ( haveToLoad(file.url, s.domCheck, file.type, complete) ) {
            // pending[url] is a callbacks array
            pending[file.url] = [complete];
            ++pending.__length;
            
            var elem = self[file.type](file.url, updateStatus);
            
            s.timeout && setTimeout(function(){
                updateStatus.call(elem, file.url, 'error');
            }, s.timeout);
        }        
    }
    
    // fire all callbacks
    function complete( url, status ) {
        if (status === 'success') {
            ++progress.loaded;
            loaded.push(url);
            self.dispatch('progress', [url, progress], s);
            if (progress.loaded == progress.total) 
                self.dispatch('success', [loaded], s);
        } else {
            errors.push(url);
            self.dispatch('error', [url, 'Unable to load resources.'], s);
        }

        if (progress.loaded + errors.length == progress.total){
            self.dispatch('complete', [loaded.concat(errors), errors.length ? 'error' : 'success'], s);
        }
    }   
}  

// define prototype for constructor
// all methods are for internal use
loader.prototype = {
    /**
     * Load script
     * @param {string} url
     * @param {Function} callback
     * @return {Object}
     */     
    js: function( url, callback ) {
        var script = document.createElement('script');
        script.src = url;
        script.type = 'text/javascript';
        script.charset = this.settings.charset;
        this.addHandler(script, url, callback);
        head.insertBefore(script, head.firstChild);
        return script;
    },
    /**
     * Load stylesheet
     * @param {string} url
     * @param {Function} callback
     * @return {Object} link
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
            function linkload(){
                try {
                    var ruls = link.sheet.cssRules;
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
    
        head.insertBefore(link, head.firstChild);
        return link;    
    },
    /**
     * Load image
     * @param {string} url
     * @param {Function} callback
     * @return {Object} img
     */
    img: function( url, callback ) {
        var image = new Image;
        this.addHandler(image, url, callback);
        image.src = url;
        return image;
    },
    /**
     * Dispatch callbacks
     * @param {string} type
     * @param {Array} args
     * @param {Object} s
     */
    dispatch: function( type, args, s ) {
        // always add settings to the arguments array
        args.push(s);
        // dispatch callback
        $.typeOf(s[type]) == 'function' && s[type].apply(s.context, args);
        return type;        
    },
    /**
     * Attach onload and onerror handler
     * @param {Object} elem dom element
     * @param {string} url
     * @param {Function} callback
     * @return {Function} onload handler
     */
    addHandler: function( elem, url, callback ) {
        var done = false,
            s = this.settings;
        // onload handler
        function onload() {
            if ( !done && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete") ) {
                done = true;
                // Handle memory leak in IE
                elem.onload = elem.onreadystatechange = null;
                //elem.nodeName == 'SCRIPT' && removeNode(elem);
                callback && callback.call(this, url, 'success');
            }
        }
        // onerror handler
        function onerror(){
            callback && callback.call(this, url, 'error');    
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
 */
function updateStatus( url, status ) {
    if ( pending[url] ) {
        for( var i=0; i < pending[url].length; ++i) {
            pending[url][i].apply(this, arguments);    
        }
        delete pending[url];
        --pending.__length;
    }
    if ( status == 'success' && !gloaded[url] )
        gloaded[url] = this;

    return url;    
}
    
/**
 * Helper function for the check if the file is already loaded,
 * for internal usage only
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
        var attr = type === 'js' ? 'src' : 'href',
            tag = type === 'js' ? 'script' : 'link',
            elems = $(tag),
            found = false;
        if ( elems.length ) {
            for ( var i = 0; i < elems.length; ++i ) {
                if ( elems[i] == url ) {
                    found = elems[i];               
                    break;                    
                }
            }
        }            

        if ( found ) {
            pending[url] = [complete];
            updateStatus.call(found, url, 'success');
            return false;    
        }
    }
    return true;         
}

/**
 * Push all urls from json to one flat array
 * @param {Object} obj
 * @param {Array} types
 * @param {String} separator
 * @return {Array} ret
 */   
 function toArray( obj, types, separator ) {
    var ret = [], urls;
    for (var i=0; i < types.length; ++i ) {
        if ( urls = obj[types[i]] ) {
            // multiple urls in one string
            $.typeOf(urls) == 'string' && (urls = urls.split(separator));
            for ( var k = 0; k < urls.length; ++k ) {
                ret.push({url: urls[k], type: types[i]});
            }
        }
    }
    return ret;
}

/**
 * Remove dom element
 * @param {Object} elem dom node
 */
function removeNode( elem ) {
   //elem && elem.parentNode && elem.parentNode.removeChild(elem); 
}

// public api
$.extend(loader, {
    /**
     * Getter and setter for defaults
     * @param {Object|undefined} defaults
     * @return {Object|Function}
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
     * @param {string|Array|undefined} name
     * @return {Function}
     */
    remove: function( name ) {
        // handle 3 cases - one url, array of urls or all loaded files
        var type = $.typeOf(name);
        if ( type == 'string' ) {
            remove(name);
        } else if ( type == 'array' ) {
            for (var i=0; i<name.length; ++i )
                remove(name[i]);
        // remove all    
        } else {
            for ( var url in gloaded )
                remove(url);               
        }
        
        function remove(url) {
            removeNode(gloaded[url]);
            delete gloaded[url];            
        }

        return this;    
    },
    /**
     * Getter and setter for global loaded files object to avoid double loading.
     * Can be used if you have already loaded some files before not using loader,
     * and there is no dom element contained such url or you want to avoid domCheck
     * @param {string|Object|undefined} name
     * @param {string|Object} value
     * @return {Function|Object}
     */
    loaded: function( name, value ) {
        var type = $.typeOf(name);
        // its a setter
        if ( type == 'string' && value ) {
            gloaded[name] = value;
            return this;  
        // it is also setter    
        } else if (type == 'object' ) {
            $.extend(gloaded, name);
            return this;  
        // its a getter with specific name    
        } else if ( type && !value ) {
            return gloaded[name];
        // get all loaded files urls
        } else
            return gloaded;
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
        // separator for files or modules lists, when used instead of array
        separator: ' ',
        // will be added to each link element
        className: 'loader',
        // if timeout and request is still in pending list, error callback will be called
        timeout: 1000,
        // check in the dom if the css or script is loaded
        domCheck: false,
        // context for callbacks
        context: null,
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
global[namespace] = loader;

})(this, window.document, $, 'loader');
