'use strict';
/**
 * Created by m.chekryshov on 25.08.15.
 */

// Use this util to load some third party script
(function(window) {
  if (!window || window.ScriptLoader) {
    return;
  }

  var scriptsQueue = {};

  function appendToHead(src, callback) {
    var script = window.document.createElement('script');
    script.type = 'text/javascript';

    if (script.readyState) {  // IE
      script.onreadystatechange = function() {
        if (script.readyState === 'loaded' ||
          script.readyState === 'complete') {
          script.onreadystatechange = null;
          callback();
        }
      };
    } else {  // others
      script.onload = function() {
        callback();
      };
    }

    script.src = src;
    window.document.getElementsByTagName('head')[0].appendChild(script);
  }

  function triggerCallbacks(srcName) {
    if (!scriptsQueue[srcName]) {
      return;
    }

    for (var i = 0; i < scriptsQueue[srcName].length; i++) {
      scriptsQueue[srcName][i]();
    }

    scriptsQueue[srcName] = null;
  }

  window.ScriptLoader = {

    /**
     * Load some third party script
     *
     * @param {string} src - script src
     * @param {string} srcName - some mnemonic name of script\
     * @param {Function} [callback]
     */
    load: function(src, srcName, callback) {
      if (!src || !srcName) {
        return;
      }

      scriptsQueue[srcName] = callback ? [callback] : [];

      appendToHead(src, function() {
        triggerCallbacks(srcName);
      });
    },

    /**
     *  Wait til some script loaded and call callback
     *
     * @param {string} srcName - some mnemonic name of script
     * @param {Function} callback
     */
    wait: function(srcName, callback) {
      if (!srcName || !callback) {
        return;
      }

      if (!scriptsQueue[srcName]) {
        callback();

        return;
      }

      scriptsQueue[srcName].push(callback);
    }
  };
})(window);
