
/**
 * This is a second global namespace, I know,
 * the purpose is to make the main loader namespace portable, 
 * without to use jsonp (because using generated namespace will avoid caching)
 * @module registerModule
 * @param {string} id
 * @param {function} fn
 * @param {boolean} globalEval if true module will be converted toString and evaluated in the global context without module closure
 */
global.___registerLoaderModule___ = function registerModule( id, fn, globalEval ) {
    globalEval && (fn.globalEval = globalEval);
    registred[id] = fn;
};