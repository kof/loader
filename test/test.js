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
            js: 'jquery.ui.position.js',    
            root: {js: 'ui/'},
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
    delete window.$;
}

loader.setup({
    base: 'data/',
    root: {
        js: '',
        css: 'themes/',
        img: 'themes/images/'
    }
});


/*
module('internals', {
    setup: function() {
        stop(1000);
    },
    teardown: function() {
        deljQuery();
    }
});


test('internal method for js load', function(){
   expect(3);
    var rurl = 'data/jquery.js';
    var script = new loader().js(rurl, function(url, status){
        ok(true, 'js is loaded');
        ok(status === 'success', 'status is correct');
        ok(url === rurl, 'url is correct');
        setTimeout(function(){
            script.parentNode.removeChild(script);    
            start();
        }, 20);
    });
});



test('internal method for css load - same host', function(){
    expect(3);
    var rurl = 'data/themes/jquery.ui.core.css';
    var link = new loader().css(rurl, function(url, status){
        ok(true, 'css is loaded');
        ok(status === 'success', 'status is correct');
        ok(url === rurl, 'url is correct');
        setTimeout(function(){
            link.parentNode.removeChild(link);    
            start();
        }, 20);        
    });
});


test('internal method for css load - external host', function(){
    expect(3);
    var link = new loader().css(externalCss, function(url, status){
        ok(true, 'css is loaded');
        ok(status === 'success', 'status is correct');
        ok(url === externalCss, 'url is correct');
        setTimeout(function(){
            link.parentNode.removeChild(link);    
            start();
        }, 20);
    });
});

test('internal method for succsessfull image load', function(){
    expect(3);
    var rurl = 'data/themes/images/ui-icons_cd0a0a_256x240.png';
    new loader().img(rurl, function(url, status){
        ok(true, 'image is loaded');
        ok(status === 'success', 'status is correct');
        ok(rurl === url, 'url is correct');
        start();
    });
});

test('internal method image load without success', function(){
    expect(3);
    var rurl = 'data/themes/images/no-name-image.png';
    new loader().img(rurl, function(url, status){
        ok(true, 'image is loaded');
        ok(status === 'error', 'status is correct');
        ok(rurl === url, 'url is correct');
        start();
    });
});

*/
/*

loader.remove();
deljQuery();





module('loader', {
    setup: function() {
        stop(1000);
    },
    teardown: function() {
        deljQuery();
    }
});

test('load one js file', function(){
    expect(8);
    var rurl = 'jquery.js';   
    loader({
        js: rurl,
        error: function(){
            ok(false, 'error callback');    
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            var url = s.base + s.root.js + rurl;
            ok(urls[0]==url, 'urls array is correct');
            ok(status === 'success', 'status is correct');
            start();
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');    
            var pr = s.base + s.root.js;
            ok(pr+rurl === url, 'url is correct');
            same({total: 1, loaded: 1}, progress, 'progress data is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
            var url = s.base + s.root.js + rurl;
            ok(urls[0]==url, 'urls array is correct');
        }
    }); 
});


test('load one css file', function(){
    expect(8);
    var rurl = 'jquery.ui.core.css';   
    loader({
        css: rurl,
        error: function(){
            ok(false, 'error callback');    
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            var url = s.base + s.root.css + rurl;
            ok(urls[0] == url, 'urls array is correct');
            ok(status === 'success', 'status is correct');
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');   
            var _url = s.base + s.root.css + rurl;
            ok(_url == url, 'urls array is correct');
            same(progress, {total: 1, loaded: 1}, 'progress data is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
            var url = s.base + s.root.css + rurl;
            ok(urls[0] == url, 'urls array is correct');
            start();
        }
    }); 
});


test('load 2 independent js files asynchron', function(){
    expect(11);
    var rurl1 = 'jquery.js',
        rurl2 = 'jquery.ui.widget.js',
        eprogress = {total: 2, loaded: 0};

    loader({
        js: [rurl1, rurl2],
        error: function(){
            ok(false, 'error callback');    
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
             var pr = s.base + s.root.js;
            ok($.inArray(pr+rurl1, urls)>=0 && $.inArray(pr+rurl2, urls)>=0, 'urls array is correct');
            ok(status === 'success', 'status is correct');
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');
            var pr = s.base + s.root.js;    
            ok(pr+rurl1 == url || pr+rurl2 == url, 'url is correct');
            ++eprogress.loaded;
            same(progress, eprogress, 'progress data is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
             var pr = s.base + s.root.js;
            ok($.inArray(pr+rurl1, urls)>=0 && $.inArray(pr+rurl2, urls)>=0, 'urls array is correct');
            start();
        }
    }); 
});




test('load 2 independent files asynchron ( one css and one js file )', function(){
    expect(13);
    var load = getModules()['ui.widget'],
        files = (load.js+ ' ' + load.css).split(' '),
        eprogress = {total: files.length, loaded: 0};
        
    $.loader({
        js: load.js,
        css: load.css,
        error: function(){
            ok(false, 'error callback');    
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');
            ++eprogress.loaded;
            same(progress, eprogress, 'progress data is correct');
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            ok(files.length == urls.length, 'urls array length is correct')
            ok(status === 'success', 'status is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
            ok(files.length == urls.length, 'urls array length is correct')
            start();
        }
    }); 
});



test('timeout test - load 3 independent files asynchron ( css, js and image ), js url is wrong', function(){
    expect(7);
    var load = {
            js: 'jquery.ui.core-test.js',  // fake broken url
            css: 'jquery.ui.core.css'
        },
        eprogress = {total: 2, loaded: 0};
    
    $.loader({
        js: load.js,
        css: load.css,
        timeout: 100,
        error: function(url, error, s){
            ok(true, 'error callback');
            ok(s.base+s.root.js+load.js === url, 'faked url is correct');
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            ok($.inArray(s.base + s.root.js+load.js, urls)>=0 && $.inArray(s.base + s.root.css+load.css, urls)>=0, 'urls array is correct');
            ok(status === 'error', 'status ' + status + ' is correct');
            start();
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');
            ++eprogress.loaded;
            same(progress, eprogress, 'progress data is correct');
        }
    }); 
});


//can't test this with msie, because there is no onerror callback
!$.browser.msie &&
test('error test - load 3 independent files asynchron ( css, js and image ), js url is wrong', function(){
    if ( QUnit.isLocal && $.browser.mozilla ) {
        ok(false, 'FF can not be tested locally');
        start();        
        return;   
    }
    
    expect(7);
    var load = {
            js: 'jquery.ui.core-test.js',  // fake broken url
            css: 'jquery.ui.core.css'
        },
        eprogress = {total: 2, loaded: 0};
    
    $.loader({
        js: load.js,
        css: load.css,
        error: function(url, error, s){
            ok(true, 'error callback');
            ok(s.base+s.root.js+load.js === url, 'faked url '+ url +' is correct');
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            ok($.inArray(s.base + s.root.js+load.js, urls)>=0 && $.inArray(s.base + s.root.css+load.css, urls)>=0, 'urls array is correct');
            ok(status === 'error', 'status is correct');
            start();
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');
            ++eprogress.loaded;
            same(progress, eprogress, 'progress data is correct');
        }
    }); 
});






test('domCheck option', function(){
    expect(3);
    var rurl = 'jquery.ui.core.js';
    // load script using internal method without registring
    // loaded script, and then load it using external api and check if it was double loaded
    new $.loader().js('data/ui/'+rurl, function(){
        $.loader({
            js: rurl,
            domCheck: true,
            success: function(urls, s){
                ok(true, 'success callback called');
                ok($.inArray(s.base+s.root.js+rurl, urls)>=0, 'urls param contains loaded file');
                ok($('script[src*="'+ rurl +'"]').length == 1, 'script was loaded only once');
                start();
            }
        });
    });

});



test('check events', function(){
    expect(9);

    var load = getModules()['ui.widget'];
     
    $(window).bind('loaderstart.test loadercomplete.test loadersuccess.test loaderprogress.test', function( e, s ){
        ok(true, e.type + ' event fired');
    });
    
     
    $.loader({
        js: load.js,
        css: load.css,
        success: function(urls, s){
            ok(true, 'success callback');
            ok((load.js + ' ' + load.css).split(' ').length == urls.length, 'urls array length is correct');
            
            setTimeout(function(){
                $(window).unbind('.test');    
                start();
            });
        }
    }); 
});

*/
module('load modules', {
    setup: function() {
        stop(1000);
    },
    teardown: function() {
        loader.remove();
        //deljQuery();
    }
});


loader.remove();
deljQuery();

// setup loader
loader.deps(getModules());
    
    
test('load ui.widget, use callback', function(){
    expect(2);
    loader('ui.dialog', function(module, deps, s){
        same('ui.dialog', module, 'module is correct');
        equal(typeof $.ui.dialog, 'function', '$.ui.dialog is object');
        start();
    });
    
});


/*



(function(){
    
var modulesArray = [];

$.each(getModules(), function(module, def){
    module = module.split('.')[1];
    module && modulesArray.push(module);
});

(function testModule( index ) {
    var namespace = modulesArray[index],
        module = 'ui.' + namespace;
    
    if (!namespace) return;
    
    test('load "' + module + '", use only success callback', function(){
        expect(4);
        $.loader(module, function(_module, s){
            ok(true, 'loaded');
            same( _module, module, 'loaded module name is correct');
            ok(typeof $.ui == 'object', '$.ui is object');
            ok(typeof $.ui[namespace] != 'undefined', module +' is ' + typeof $.ui[namespace]);
            start();
            //testModule(++index);
        });
        
    });
    
        
})(2);



(function testModule1( index ) {
    var namespace = modulesArray[index],
        module = 'ui.' + namespace;
    
    if (!namespace) return;
    
    test('load "' + module + '", check all callbacks callback', function(){
        expect(6);
        $.loader(module, {
            success: function(_module, s){
                ok(true, 'success');
                same( _module, module, 'loaded module name "'+ _module +'" is correct');
                ok(typeof $.ui == 'object', '$.ui is object');
                ok(typeof $.ui[namespace] != 'undefined', module +' is ' + typeof $.ui[namespace]);
                start();
                testModule1(++index);
            },
            complete: function(_module, status, s){
                ok(true, 'complete');
                same( _module, module, 'loaded module name "'+ _module +'" is correct');
            },
            error: function(_module, error, s){
                ok(false, 'module "'+_module+'" caused error callback');
            },            
            progress: function(_module, progress, s){
                  
            }            
                        
        });
        
    });
    
        
})//(1);



})();



/**/

})();



