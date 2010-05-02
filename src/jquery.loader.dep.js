/**
 * jquery plugin for dependencies definition
 *
 * @version 0.1
 * @author Oleg Slobodskoi aka Kof
 * @website jsui.de
 */

(function($, window){

var // current packages
    p = {},
    // settings
    s = {
        root: '',
        separator: ' ',
        loader: $.xLazyLoader
    },
    jsCssFileTypes = /css|js/,
    imageFileTypes = /jpg|png|gif|tiff|raw|bmp/;

/**
 * Getter and setter for settings setup
 * @param {Object} options
 * @return {Object} s || this
 */
function setup( options ) {
   if ( options ) {
       $.extend(s, options);
       return this;
   } else    
       return s;
}

/**
 * Getter and setter for packages
 * @param {Object} packages
 * @return {Object} p || this
 */
function def( packages ) {
   if ( packages ) {
       $.extend(p, packages);
       return this;
   } else    
       return p;
}

/**
 * Load package
 * @param {String} name
 * @param {Function} callback
 * @return {Object} this
 */
function load( name, callback ) {
    !p[name] && $.error('lazyload: package ' + name + ' is not defined');
    
    // resolve dependencies throw package name
    var names = name.split('.');
    if ( names.length > 1 ) {
        var i = 0;
        (function(){
            if (i < names.length - 1) {
                load(names[i], arguments.callee);
            } else {
                startLoad();
            }             
            ++i;
        })()
        return this;
    }
    
    function handleLoad(i, files) {
        var data = parse(files);
        data.success = callback;
        data.name = name;    
        s.loader(data);
    }
    
    function startLoad() {
        // asynchron
        if ( $.isArray(p[name]) ) {
            $.each(p[name], handleLoad);
        // synchron    
        } else {
            handleLoad(null, p[name]);
        }
    }
    
    startLoad();

    return this;
}

function destroy( name ) {
    $.each(name.split(s.separator), function(i, name){
        s.loader('destroy', name);    
    });
    return this;
}



function parse( files ) {
    var data = {},
        fi;
    typeof files == 'string' && (files = files.split(s.separator));
    for (var i=0; i < files.length; ++i ) {
        fi = fileInfo(files[i]);
        // load package first before parsing further
        if ( fi.type == 'package' ) {
            $.each(parse(p[fi.name]), function(type, files){
                !data[type] && (data[type] = []);
                data[type] = data[type].concat(files);
            });
        // its js, css and img
        } else {
            !data[fi.type] && (data[fi.type] = []);
            data[fi.type].push(s.root + fi.name);
        }
    }
    return data;
}

/**
 * Parse filename or package name
 * @param {String} name
 * @return {Object} {name: name, type: type}
 */
function fileInfo( name ) {
    var pointIndex = name.lastIndexOf('.');
    if (pointIndex >= 0) {
        var type = name.substr(pointIndex+1);
        if ( !jsCssFileTypes.test(type) ) {
            if ( imageFileTypes.test(type) ) {
                type = 'img';
            } else
                $.error('lazyload: unsupported file type.');       
        }
        
    } else {
        type = 'package';
        name = name.substr(1, name.length-2);    
    }

    return {
        name: name,
        type: type
    };    
}

// provide public namespaces    
$.dep = {
    setup: setup,
    def: def,
    load: load,
    destroy: destroy
};    
    
})(jQuery, this); 
