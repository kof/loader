/**
 * 
 * Use this to load the loader in the head of the document
 */

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
})( document, 'url', function(){
    // your bootstrap here
});
