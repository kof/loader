(function(){

var externalCss = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery.ui.core.css';

function getModules() {
    return {
        'jquery': {
            js: 'jquery.js' 
        },
        'ui.widget': {
            depends: 'jquery',
            root: {js: 'ui/'},
            js: 'jquery.ui.core.js jquery.ui.widget.js',
            css: 'jquery.ui.core.css jquery.ui.theme.css'
        },
        'ui.position': {
            depends: 'jquery',
            js: 'jquery.ui.position.js',    
            root: {js: 'ui/'}
        },
        'ui.mouse': {
            depends: 'ui.widget',
            root: {js: 'ui/'},
            js: 'jquery.ui.mouse.js'    
        },
        'ui.draggable': {
            depends: 'ui.mouse',
            root: {js: 'ui/'},
            js: 'jquery.ui.draggable.js'
        },
        'ui.droppable': {
            depends: 'ui.mouse ui.draggable',
            root: {js: 'ui/'},
            js: 'jquery.ui.droppable.js'
        },
        'ui.resizable': {
            depends: 'ui.mouse',
            root: {js: 'ui/'},
            js: 'jquery.ui.resizable.js',
            css: 'jquery.ui.resizable.css'
        },
        'ui.selectable': {
            depends: 'ui.mouse',
            root: {js: 'ui/'},
            js: 'jquery.ui.selectable.js'
        },
        'ui.sortable': {
            depends: 'ui.mouse',
            root: {js: 'ui/'},
            js: 'jquery.ui.sortable.js'
        },
        'ui.accordion': {
            depends: 'ui.widget',
            root: {js: 'ui/'},
            js: 'jquery.ui.accordion.js',
            css: 'jquery.ui.accordion.css'
        },
        'ui.autocomplete': {
            depends: 'ui.widget ui.position',
            root: {js: 'ui/'},
            js: 'jquery.ui.autocomplete.js',
            css: 'jquery.ui.autocomplete.css'    
        },
        'ui.button': {
            depends: 'ui.widget',
            root: {js: 'ui/'},
            js: 'jquery.ui.button.js',
            css: 'jquery.ui.button.css'
        },
        'ui.progressbar': {
            depends: 'ui.widget',
            root: {js: 'ui/'},
            js: 'jquery.ui.progressbar.js',
            css: 'jquery.ui.progressbar.css'
        },      
        'ui.slider': {
            depends: 'ui.mouse',
            root: {js: 'ui/'},
            js: 'jquery.ui.slider.js',
            css: 'jquery.ui.slider.css'
        },          
        'ui.tabs': {
            depends: 'ui.widget',
            root: {js: 'ui/'},
            js: 'jquery.ui.tabs.js',
            css: 'jquery.ui.tabs.css'
        },
        'ui.dialog': {
            depends: 'ui.mouse ui.position ui.button ui.draggable ui.resizable',
            root: {js: 'ui/'},
            js: 'jquery.ui.dialog.js',
            css: 'jquery.ui.dialog.css'
        }
    }
}

function deljQuery() {
    delete window.jQuery;
}

loader.setup({
    base: 'data/',
    root: {
        js: '',
        css: 'themes/',
        img: 'themes/images/'
    },
    timeout: 400
});


// add dependencies
loader.deps( getModules() );


module('loader', {
    teardown: function() {
        deljQuery();
        // remove all loaded
        loader.remove();
    }
});

asyncTest('load one js file', 2, function(){
    var url = 'jquery.js';
    loader({
        js: url,
        success: function( files, s ) {
            ok(true, 'success callback is called');
            ok(files[0] === s.base + url, 'url is correct');
            start();
        }
    });
});


asyncTest('load one js file - test error callback', 3, function(){
    var url = 'file-not-exists.js';
    loader({
        js: url,
        success: function( files, s ) {
            ok(false, 'success callback is called');
        },
        error: function( file, message, s) {
            ok(true, 'error callback is called');
            ok(typeof message == 'string', 'error message is given');
            ok(file === s.base + s.root.js + url, 'url is correct');
            start();
        }
    });
});


asyncTest('load one css file - same host', 2, function(){
    var url = 'jquery.ui.core.css';
    loader({
        css: url,
        success: function( files, s ) {
            ok(true, 'success callback is called');
            ok(files[0] === s.base + s.root.css + url, 'url is correct');
            start();
        }
    });    
});

asyncTest('load one css file - external host (crossdomain)', 2, function(){
    loader({
        css: externalCss,
        success: function( files, s ) {
            ok(true, 'success callback is called');
            ok(files[0] === externalCss, 'url is correct');
            start();
        }
    });    
});

asyncTest('load one image file', 2, function(){
    var url = 'ui-icons_cd0a0a_256x240.png';
    loader({
        img: url,
        success: function( files, s ) {
            ok(true, 'success callback is called');
            ok(files[0] === s.base + s.root.img + url, 'url is correct');
            start();
        }
    });    
});

asyncTest('load an image file - test error callback', 2, function(){
    var url = 'no-name-image.png';
    loader({
        img: url,
        error: function( file, message, s ) {
            ok(true, 'error callback is called');
            ok(file === s.base + s.root.img + url, 'url is correct');
            start();
        }
    });
});

asyncTest('load 2 js files and test complete, progress and success callbacks', 9, function(){
    var files = ['jquery.js', 'ui/jquery.ui.widget.js'],
        prg = {total: 2, loaded: 0};
    loader({
        js: files,
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            var pr = s.base + s.root.js;
            same( urls, [pr + files[0], pr + files[1]], 'urls array is correct' );
            ok(status === 'success', 'status success is correct');
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');
            ++prg.loaded;
            same(progress, prg, 'progress data is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
             var pr = s.base + s.root.js;
            same( urls, [pr + files[0], pr + files[1]], 'urls array is correct' );
            start();
        }        
        
    });
});

asyncTest('load 3 files (1 css, 1 js, 1 image) and test complete, progress and success callbacks', 9, function() {

    var js = 'jquery.js',
        css = 'jquery.ui.core.css',
        img = 'ui-anim_basic_16x16.gif',
        prg = {total: 3, loaded: 0};

    loader({
        js: js,
        css: css,
        img: img,
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            ok(status === 'success', 'status success is correct');
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');
            ++prg.loaded;
            same(progress, prg, 'progress data is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
            start();
        }        
        
    });
});


asyncTest('test domCheck option', 3, function(){
    (function( document, url, callback ){
        var head = document.getElementsByTagName('head')[0] || document.documentElement,
            script = document.createElement('script');
        script.src = url;
        script.onload = script.onreadystatechange = function() {
            if ( script && (!this.readyState || /loaded|complete/.test(this.readyState) ) ) {
                script = null;
                callback && callback();
            }
        };
        head.insertBefore(script, head.firstChild);
    })( document, 'data/dom-check.js', function(){
    
        ok(window.domCheckTest === true, 'file is loaded' );
        delete window.domCheckTest;
        
        loader({
            js: 'dom-check.js',
            domCheck: true,
            success: function( urls, s ) {
                ok(true, 'success callback called');
                ok(window.domCheckTest !== true, 'file was not double loaded' );
                start();
            }
        });        
    
    });


});

asyncTest('load ui.dialog, use callback', 2, function(){
    loader('ui.dialog', function(module, deps, s){
        same('ui.dialog', module, 'module is correct');
        equal(typeof $.ui.dialog, 'function', '$.ui.dialog is object');
        start();
    });
    
});


(function(){

var modules = [];
for ( var name in getModules() ) {
    modules.push(name);
}    

function callTest( i ) {
    var name = modules[i];
    asyncTest('load "' + name + '", use only success callback', 2, function(){
        loader(name, function( module, s){
            ok(true, 'loaded');
            same(  module, name, 'loaded module name is correct');
            //ok(typeof $.ui == 'object', '$.ui is object');
            var namespace = name.split('.').pop();
            //ok(typeof $.ui[namespace] != 'undefined', namespace +' is ' + typeof $.ui[namespace]);
            start();
            i+1<modules.length && callTest( ++i );    
        });
        
    });    
}
    
callTest(0);

})();

// issue #2
asyncTest('load a file and then load the same again', 2, function(){

    loader({
        js: "jquery.js",
        complete: function( files, s ) {
            ok(true, 'first callback');
            loader({
                js: "jquery.js",
                success: function( files, s ) {
                    ok(true, 'seccond callback');
                    start();
                }
            });
        }
    }); 
});


/**/

})();



