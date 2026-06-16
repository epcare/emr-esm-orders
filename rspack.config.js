const path = require('path');

module.exports = (config, options) => {
  const defaultConfig = require('openmrs/default-rspack-config')(config, options);

  // Ensure .ts extensions are resolved
  if (!defaultConfig.resolve) {
    defaultConfig.resolve = { extensions: ['.js', '.json'] };
  }
  if (!defaultConfig.resolve.extensions) {
    defaultConfig.resolve.extensions = ['.js', '.json'];
  }
  if (!defaultConfig.resolve.extensions.includes('.ts')) {
    defaultConfig.resolve.extensions.push('.ts');
  }
  if (!defaultConfig.resolve.extensions.includes('.tsx')) {
    defaultConfig.resolve.extensions.push('.tsx');
  }

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

  // Fix Module Federation exposes to use relative paths with ./ prefix
  const root = process.cwd();
  if (defaultConfig.plugins) {
    // Remove TsCheckerRspackPlugin to avoid TypeScript checking issues with upstream packages
    defaultConfig.plugins = defaultConfig.plugins.filter(plugin => plugin.constructor.name !== 'TsCheckerRspackPlugin');

    defaultConfig.plugins.forEach((plugin) => {
      if (plugin.constructor.name === 'ModuleFederationPlugin' && plugin._options && plugin._options.exposes) {
        const exposes = {};
        for (const [key, value] of Object.entries(plugin._options.exposes)) {
          if (typeof value === 'string' && path.isAbsolute(value)) {
            const relativePath = path.relative(root, value);
            exposes[key] = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
          } else {
            exposes[key] = value;
          }
        }
        plugin._options.exposes = exposes;
      }
    });
  }

  // Temporarily disable minimizer due to configuration issue
  if (defaultConfig.optimization) {
    delete defaultConfig.optimization.minimizer;
  }

  return defaultConfig;
};
