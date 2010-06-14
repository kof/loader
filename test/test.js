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
    timeout: 800
});

// add dependencies
loader.deps( getModules() );


module('loader', {
    setup: function() {
        stop(1000);
    },
    teardown: function() {
        deljQuery();
        // remove all loaded
        loader.remove();
    }
});


test('load one js file', function(){
    expect(2);
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

test('load one js file - test error callback', function(){
    expect(3);
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


test('load one css file - same host', function(){
    expect(2);
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

test('load one css file - external host (crossdomain)', function(){
    expect(2);
    loader({
        css: externalCss,
        success: function( files, s ) {
            ok(true, 'success callback is called');
            ok(files[0] === externalCss, 'url is correct');
            start();
        }
    });    
});

test('load one css file - test error callback', function(){
    expect(3);
    var url = 'file-not-exists.css';
    loader({
        css: url,
        success: function( files, s ) {
            ok(false, 'success callback is called');
        },
        error: function( file, message, s) {
            ok(true, 'error callback is called');
            ok(typeof message == 'string', 'error message is given');
            ok(file === s.base + s.root.css + url, 'url is correct');
            start();
        }
    });
});

test('load one image file', function(){
    expect(2);
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

test('load an image file - test error callback', function(){
    expect(2);
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

test('load 2 js files and test complete, progress and success callbacks', function(){
    expect(9);
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

test('load 3 files (1 css, 1 js, 1 image) and test complete, progress and success callbacks', function() {
   expect(9);
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




test('test domCheck option', function(){
    expect(4);
    var url = 'jquery.js',
        script;

    (function( document, url, callback ){
        var head = document.getElementsByTagName('head')[0] || document.documentElement;
        
        script = document.createElement('script');
        script.src = url;
        script.onload = script.onreadystatechange = function() {
            if ( script && (!this.readyState || /loaded|complete/.test(this.readyState) ) ) {
                script = null;
                callback && callback();
            }
        };
        head.insertBefore(script, head.firstChild);
    })( document, 'data/' + url, function(){
        loader.exec(url);
        ok(typeof jQuery == 'function', 'jQuery was loaded' );
        deljQuery();
        
        
        
        // loader should check, that jquery script is already loaded and don't load it again
        loader({
            js: url,
            domCheck: true,
            success: function( urls, s ) {
                ok(true, 'success callback called');
                ok(urls[0] == s.base + s.root.js + url, 'urls is correct');
                ok(typeof jQuery != 'function', 'jQuery was not loaded' );
                start();
            }
        });        


    });
});

test('load ui.dialog, use callback', function(){
    expect(2);
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
    test('load "' + name + '", use only success callback', function(){
        //expect(4);
        loader(name, function( module, s){
            ok(true, 'loaded');
            same(  module, name, 'loaded module name is correct');
            //ok(typeof $.ui == 'object', '$.ui is object');
            var namespace = name.split('.').pop();
            //ok(typeof $.ui[namespace] != 'undefined', namespace +' is ' + typeof $.ui[namespace]);
            start();
            i++;
            callTest( i );
        });
        
    });    
}
    
callTest(0);

})();



/**/

})();



