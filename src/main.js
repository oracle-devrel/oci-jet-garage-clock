/**
 * @license
 * Copyright (c) 2014, 2023, Oracle and/or its affiliates.
 * Licensed under The Universal Permissive License (UPL), Version 1.0
 * as shown at https://oss.oracle.com/licenses/upl/
 * @ignore
 */
"use strict";

/**
 * Example of Require.js bootstrap javascript
 */

(function () {
  requirejs.config({
    // injector:baseUrl
    baseUrl: ".",
    // endinjector
    paths:
      /* DO NOT MODIFY
       ** All paths are dynamically generated from the path_mappings.json file.
       ** Add any new library dependencies in path_mappings json file
       */
      // injector:mainReleasePaths
      {},
    // endinjector
  });
})();

/**
 * Load the application's entry point file
 */
require(["./index"]);
