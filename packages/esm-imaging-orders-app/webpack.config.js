const path = require('path');

module.exports = (config, options) => {
  const defaultConfig = require('openmrs/default-webpack-config')(config, options);

  // Fix module transpilation for @openmrs packages that publish TypeScript source
  // The default config excludes all node_modules, but some packages like
  // @openmrs/esm-patient-common-lib have "source": true and "main": "src/index.ts"
  // requiring transpilation by the consumer.
  if (defaultConfig.module && defaultConfig.module.rules) {
    const scriptRule = defaultConfig.module.rules.find(
      (rule) => rule.test && rule.test.test && rule.test.test('.ts') && rule.exclude
    );
    if (scriptRule) {
      // Change from /node_modules/ to a function that excludes node_modules EXCEPT
      // for @openmrs packages that need transpilation
      scriptRule.exclude = (filepath) => {
        // Return true to exclude (skip transpilation), false to include (transpile)
        if (/node_modules/.test(filepath)) {
          // Include (transpile) files from @openmrs packages that publish source
          if (/@openmrs\/(esm-patient-common-lib|esm-form-engine-lib|esm-imaging-common-lib)/.test(filepath)) {
            return false; // Don't exclude — transpile these
          }
          return true; // Exclude all other node_modules
        }
        return false; // Don't exclude non-node_modules files
      };
    }
  }

  return defaultConfig;
};
