'use strict';
/**
 * Created by m.chekryshov on 25.08.15.
 */

  // Use this util to load third party script asynchronously
(function(window) {
  if (!window || window.ScriptLoader) {
    return;
  }

  var scriptsQueue = {};

  /**
   * Append script to the head section
   * When page already contains script with equivalent src it will be replaced without duplication
   *
   * @param {string} src - script src
   * @param {string} srcName - mnemonic name of script
   */
  function appendToHead(src, srcName) {
    var script = window.document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;

    if (script.readyState) { // IE
      script.onreadystatechange = function() {
        if (script.readyState === 'loaded' ||
            script.readyState === 'complete') {
          script.onreadystatechange = null;
          setTimeout(function() {
            triggerCallbacks(srcName, 'success');
          }, 0);
        }
      };
    } else { // others
      script.onload = function() {
        triggerCallbacks(srcName, 'success');
      };
      script.onerror = function() {
        triggerCallbacks(srcName, 'error');
      };
    }
    addOrReloadScript(script);
  }

  function addOrReloadScript(script) {
    var scripts = document.getElementsByTagName('script');
    var scriptToReplace;

    // try remove script if it already loaded
    for (var i = 0; i < scripts.length; i++) {
      var currentScriptSrc = scripts[i].src;
      // check script src ending
      if (currentScriptSrc.indexOf(script.src, currentScriptSrc.length - script.src.length) !== -1) {
        scriptToReplace = scripts[i];
        break;
      }
    }

    if (scriptToReplace) {
      var scriptParentNode = scriptToReplace.parentNode;

      scriptParentNode.insertBefore(script, scriptToReplace);
      scriptParentNode.removeChild(scriptToReplace);
    } else {
      var firstScript = document.getElementsByTagName('script')[0];
      firstScript.parentNode.insertBefore(script, firstScript);
    }
  }

  function triggerCallbacks(srcName, callbackName) {
    if (isArray(scriptsQueue[srcName])) {
      for (var i = 0; i < scriptsQueue[srcName].length; i++) {
        var callback = scriptsQueue[srcName][i][callbackName];
        callback && callback();
      }
    }

    scriptsQueue[srcName] = callbackName;
  }

  function isArray(arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  }

  function addCallbacks(srcName, successCallback, errorCallback) {
    if (!successCallback && !errorCallback) {
      return;
    }

    if (!isArray(scriptsQueue[srcName])) {
      scriptsQueue[srcName] = [];
    }

    scriptsQueue[srcName].push({
      success: successCallback,
      error: errorCallback
    });
  }

  window.ScriptLoader = {

    /**
     * Add or reload third party script asynchronously
     * When page already contains script with equivalent src it will be replaced without duplication
     *
     * @param {string} src - script src
     * @param {string} srcName - mnemonic name of script
     * @param {Function} [successCallback]
     * @param {Function} [errorCallback]
     */
    load: function(src, srcName, successCallback, errorCallback) {
      if (!src || !srcName) {
        return;
      }

      addCallbacks(srcName, successCallback, errorCallback);
      appendToHead(src, srcName);
    },

    /**
     *  Wait loading the specified script and call callback function on ready
     *
     * @param {string} srcName - mnemonic name of the script
     * @param {Function} successCallback
     * @param {Function} [errorCallback]
     */
    wait: function(srcName, successCallback, errorCallback) {
      if (!srcName || !successCallback) {
        return;
      }

      if (scriptsQueue[srcName] === 'success') { // script was successfully loaded
        successCallback();
      } else if (scriptsQueue[srcName] === 'error') { // an error occurred
        errorCallback && errorCallback();
      } else { // script loading in progress or was newer called
        addCallbacks(srcName, successCallback, errorCallback);
      }
    }
  };
})(window);
