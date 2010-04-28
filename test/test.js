module('dependencies', {
    setup: function() {
        this.settings = $.dep.setup();
        this.dep = $.dep.def();
        $.dep.setup({root: 'dummy/'})
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

