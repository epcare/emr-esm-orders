module.exports = (config, options) => {
  const defaultConfig = require('openmrs/default-rspack-config')(config, options);

  // Transpile @openmrs/esm-patient-common-lib, which publishes TypeScript source
  // ("main": "src/index.ts", "source": true). The default config excludes all of
  // node_modules from the script rule, so its sources would otherwise be parsed
  // as plain JS and fail.
  if (defaultConfig.module && defaultConfig.module.rules) {
    const scriptRule = defaultConfig.module.rules.find(
      (rule) => rule.test && rule.test.test && rule.test.test('.ts') && rule.exclude,
    );
    if (scriptRule) {
      scriptRule.exclude = (filepath) => {
        if (/node_modules/.test(filepath)) {
          return !/@openmrs\/esm-patient-common-lib/.test(filepath);
        }
        return false;
      };
    }
  }

  return defaultConfig;
};
