(function(){

var externalCss = 'http://ajax.googleapis.com/ajax/libs/jqueryui/1.8/themes/base/jquery.ui.core.css';

function getModules() {
    return {
        'ui': {
            js: 'jquery.ui.core.js',
            css: 'jquery.ui.core.css'
        },
        'widget': {
            js: 'jquery.ui.widget.js',
            css: 'themes/jquery.ui.theme.css'
        },
        'ui.position': {
            js: 'jquery.ui.position.js'    
        },
        'ui.mouse': {
            depends: 'widget',
            js: 'jquery.ui.mouse.js'    
        },
        'ui.draggable': {
            depends: ['widget', 'ui.mouse'],
            js: 'jquery.ui.draggable.js'
        },
        'ui.droppable': {
            depends: 'ui.draggable',
            js: 'jquery.ui.droppable.js'
        },
        'ui.resizable': {
            depends: ['widget', 'ui.mouse'],
            js: 'jquery.ui.resizable.js',
            css: 'jquery.ui.resizable.css'
        },
        'ui.selectable': {
            depends: ['widget', 'ui.mouse'],
            js: 'jquery.ui.selectable.js'
        },
        'ui.sortable': {
            depends: ['widget', 'ui.mouse'],
            js: 'jquery.ui.sortable.js'
        },
        'ui.accordion': {
            depends: 'widget',
            js: 'jquery.ui.accordion.js',
            css: 'jquery.ui.accordion.css'
        },
        'ui.autocomplete': {
            depends: ['widget', 'ui.position'],
            js: 'jquery.ui.autocomplete.js',
            css: 'jquery.ui.autocomplete.css'    
        },
        'ui.button': {
            depends: 'widget',
            js: 'jquery.ui.button.js',
            css: 'jquery.ui.button.css'
        },
        'ui.progressbar': {
            depends: 'widget',
            js: 'jquery.ui.progressbar.js',
            css: 'jquery.ui.progressbar.css'
        },      
        'ui.slider': {
            depends: ['widget', 'ui.mouse'],
            js: 'jquery.ui.slider.js',
            css: 'jquery.ui.slider.css'
        },          
        'ui.tabs': {
            depends: 'widget',
            js: 'jquery.ui.tabs.js',
            css: 'jquery.ui.tabs.css'
        },
        'ui.dialog': {
            depends: ['widget', 'ui.position', 'ui.draggable', 'ui.resizable', 'ui.button'],
            js: 'jquery.ui.dialog.js',
            css: 'jquery.ui.dialog.css'
        }
    }
}


module('internals', {
    setup: function() {
        stop(500);
    },
    teardown: function() {
        delete $['ui'];
    }
});

test('internal method for js load', function(){
   expect(3);
    var rurl = 'data/ui/jquery.ui.core.js';
    var script = new $.loader().js(rurl, function(url, status){
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
    var link = new $.loader().css(rurl, function(url, status){
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
    var link = new $.loader().css(externalCss, function(url, status){
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
    new $.loader().img(rurl, function(url, status){
        ok(true, 'image is loaded');
        ok(status === 'success', 'status is correct');
        ok(rurl === url, 'url is correct');
        start();
    });
});

test('internal method image load without success', function(){
    expect(3);
    var rurl = 'data/themes/images/no-name-image.png';
    new $.loader().img(rurl, function(url, status){
        ok(true, 'image is loaded');
        ok(status === 'error', 'status is correct');
        ok(rurl === url, 'url is correct');
        start();
    });
});


module('loader', {
    setup: function() {
        stop(500);
        this.defaults = $.extend({}, $.loader.setup());
        $.loader.setup({
            base: 'data/',
            root: {
                js: 'ui/',
                css: 'themes/',
                img: 'themes/images/'
            }
        });
    },
    teardown: function() {
        $.loader
        .destroy()
        .setup(this.defaults);
        delete $['ui'];
    }
});


test('load one js file', function(){
    expect(8);
    var rurl = 'jquery.ui.core.js';   
    $.loader({
        js: rurl,
        error: function(){
            ok(false, 'error callback');    
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            var pr = s.base + s.root.js;
            ok($.inArray(pr+rurl, urls)>=0, 'urls array is correct');
            ok(status === 'success', 'status is correct');
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');    
            var pr = s.base + s.root.js;
            ok(pr+rurl === url, 'url is correct');
            same({total: 1, loaded: 1}, progress, 'progress data is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
            var pr = s.base + s.root.js;
            ok($.inArray(pr+rurl, urls)>=0, 'urls array is correct');
            start();
        }
    }); 
});

test('load one css file', function(){
    expect(8);
    var rurl = 'jquery.ui.core.css';   
    $.loader({
        css: rurl,
        error: function(){
            ok(false, 'error callback');    
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            var pr = s.base + s.root.css;
            ok($.inArray(pr+rurl, urls)>=0, 'urls array is correct');
            ok(status === 'success', 'status is correct');
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');   
            var pr = s.base + s.root.css;
            ok(pr+rurl === url, 'url is correct');
            same(progress, {total: 1, loaded: 1}, 'progress data is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
            var pr = s.base + s.root.css;
            ok($.inArray(pr+rurl, urls)>=0, 'urls array is correct');
            start();
        }
    }); 
});

test('load 2 independent js files asynchron', function(){
    expect(11);
    var rurl1 = 'jquery.ui.core.js',
        rurl2 = 'jquery.ui.widget.js',
        eprogress = {total: 2, loaded: 0};

    $.loader({
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
    expect(9);
    var load = getModules().ui,
        eprogress = {total: 2, loaded: 0};
    $.loader({
        js: load.js,
        css: load.css,
        error: function(){
            ok(false, 'error callback');    
        },
        complete: function(urls, status, s){
            ok(true, 'complete callback');
            ok($.inArray(s.base + s.root.js+load.js, urls)>=0 && $.inArray(s.base + s.root.css+load.css, urls)>=0, 'urls array is correct');
            ok(status === 'success', 'status is correct');
        },
        progress: function(url, progress, s){
            ok(true, 'progress callback');
            ++eprogress.loaded;
            same(progress, eprogress, 'progress data is correct');
        },
        success: function(urls, s){
            ok(true, 'success callback');
            ok($.inArray(s.base + s.root.js+load.js, urls)>=0 && $.inArray(s.base + s.root.css+load.css, urls)>=0, 'urls array is correct');
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
        timeout: 200,
        error: function(url, error, s){
            ok(true, 'error callback');
            ok(s.base+s.root.js+load.js === url, 'faked url is correct');
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


!(QUnit.isLocal && $.browser.mozilla) && 
test('error test - load 3 independent files asynchron ( css, js and image ), js url is wrong [FF fails on this test if using local]', function(){
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
            ok(s.base+s.root.js+load.js === url, 'faked url is correct');
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
    expect(7);

    var load = getModules().ui;
     
    $(window).bind('loaderstart.test loadercomplete.test loadersuccess.test loaderprogress.test', function( e, s ){
        ok(true, e.type + ' event fired');
    });
    
     
    $.loader({
        js: load.js,
        css: load.css,
        success: function(urls, s){
            ok(true, 'success callback');
            ok($.inArray(s.base + s.root.js+load.js, urls)>=0 && $.inArray(s.base + s.root.css+load.css, urls)>=0, 'urls array is correct');
            
            setTimeout(function(){
                $(window).unbind('.test');    
                start();
            });
        }
    }); 
});


/*


/*

module('dependencies', {
    setup: function() {
        this.settings = $.dep.setup();
        this.dep = $.dep.def();
        $.dep.setup({root: 'data/'})
        .def(getPackage());
    },
    teardown: function() {
        test0 = null;
        $.dep.destroy('test0 test1 test2 test3 test4 test5 test0.test1')
        .setup(this.settings).def(this.dep);
    }
});

function getPackage() {
    var p = {};
    
    p['test0'] = 'test0.js';
    
    p['test1'] = 'test0.js test0.test1.js';
    
    p['test2'] = '[test0] test0.test1.js';
    
    p['test3'] = [
        'test3.css',
        'test0.js test0.test1.js'
    ];

    p['test3'] = [
        'test3.css',
        'test0.js test0.test1.js'
    ];

    p['test4'] = [
        'test3.css',
        '[test1] test4.js'
    ];

    p['test01'] = 'test0.test1.js';
    p['test5'] = [
        '[test0] [test01]',
        'image.jpg'
    ];
    
    p['test0.test1'] = 'test0.test1.js';
    
    return p;
}

asyncTest('load test0 package', 2, function(){
    var callback = false;
    $.dep.load('test0', function(){
        callback = true;
    });
    setTimeout(function(){
        ok(callback, 'callback is called');
        ok(typeof test0 == 'object', 'test0 ojbect is defined');
        start();
    }, 15);
});

asyncTest('load test1 package', 3, function(){
    var callback = false;
    $.dep.load('test1', function(){
        callback = true;
    });
    setTimeout(function(){
        ok(callback, 'callback is called');
        ok(typeof test0 == 'object', 'test0 ojbect is defined');
        ok(typeof test0.test1 == 'object', 'test0.test1 ojbect is defined');
        start();
    }, 15);
});

asyncTest('load test2 package', 3, function(){
    var callback = false;
    $.dep.load('test2', function(){
        callback = true;
    });
    setTimeout(function(){
        ok(callback, 'callback is called');
        ok(typeof test0 == 'object', 'test0 ojbect is defined');
        ok(typeof test0.test1 == 'object', 'test0.test1 ojbect is defined');
        start();
    }, 15);
});

asyncTest('load test3 package', 4, function(){
    var callback = false;
    $.dep.load('test3', function(){
        callback = true;
    });
    setTimeout(function(){
        ok(callback, 'callback is called');
        ok(typeof test0 == 'object', 'test0 ojbect is defined');
        ok(typeof test0.test1 == 'object', 'test0.test1 ojbect is defined');
        var $div = $('<div class="css-loaded-test"/>').appendTo(document.body);
        ok( $div.width() == 100, 'css is loaded' );        
        $div.remove();
        start();
    }, 30);
});

asyncTest('load test4 package', 5, function(){
    var callback = false;
    $.dep.load('test4', function(){
        callback = true;
    });
    setTimeout(function(){
        ok(callback, 'callback is called');
        ok(typeof test0 == 'object', 'test0 ojbect is defined');
        ok(typeof test0.test1 == 'object', 'test0.test1 ojbect is defined');
        ok(typeof test4 == 'object', 'test4 object is defined');
        var $div = $('<div class="css-loaded-test"/>').appendTo(document.body);
        ok( $div.width() == 100, 'css is loaded' );        
        $div.remove();
        start();
    }, 30);
});

asyncTest('load test5 package', 3, function(){
    var callback = false;
    $.dep.load('test5', function(){
        callback = true;
    });
    setTimeout(function(){
        ok(callback, 'callback is called');
        ok(typeof test0 == 'object', 'test0 ojbect is defined');
        ok(typeof test0.test1 == 'object', 'test0.test1 ojbect is defined');
        start();
    }, 15);
});

asyncTest('load test0.test1 package', 3, function(){
    var callback = false;
    $.dep.load('test0.test1', function(){
        callback = true;
    });
    setTimeout(function(){
        ok(callback, 'callback is called');
        ok(typeof test0 == 'object', 'test0 ojbect is defined');
        ok(typeof test0.test1 == 'object', 'test0.test1 ojbect is defined');
        start();
    }, 100);
});



/**/

})();



