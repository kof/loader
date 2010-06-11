/**
 * 
 * Use this to load the loader in the head of the document
 */

(function(doc, url, callback){
    var head = doc.getElementsByTagName('head')[0] || doc.documentElement,
        script = doc.createElement('script');
    script.src = url;
    script.onload = script.onreadystatechange = function() {
        if ( script && (!this.readyState || /loaded|complete/.test(this.readyState) ) ) {
            script = null;
            callback();
        }
    };
    head.insertBefore(script, head.firstChild);
})(document, 'your script url', function(){
    // your bootstrap here
});
