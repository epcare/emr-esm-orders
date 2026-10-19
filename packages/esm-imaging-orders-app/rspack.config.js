const buildConfig = require('openmrs/default-rspack-config');
const appName = require('./package.json').name;

module.exports = function (env, argv = {}) {
  const config = buildConfig(env, argv);

  // Dev-only fix for the duplicate-framework issue: the app shell built from a
  // prerelease (e.g. 11.0.1-pre.5776) never satisfies this app's `11.x`
  // requiredVersion, so the Module Federation share lookup misses and each dev
  // remote instantiates its own bundled copy of @openmrs/esm-framework — which
  // breaks workspaces (useWorkspace2Context) and single-spa mounting. Dropping
  // the bundled fallback forces the share scope's shell-provided copy to be
  // used instead. The same treatment applies to every shared dependency (react,
  // carbon, swr, …) so the dev remote uses exactly the copies the app shell
  // provides — mixed copies break React context across the workspace system.
  // Production builds keep the fallbacks so the bundle stays
  // runnable against older shells.
  if (argv.mode !== 'production') {
    const mfp = config.plugins.find((plugin) => plugin._options?.name === appName);
    if (mfp) {
      for (const key of Object.keys(mfp._options.shared ?? {})) {
        const share = mfp._options.shared?.[key];
        if (share) {
          share.import = false;
        }
      }
    } else {
      console.warn(`[${appName}] no ModuleFederationPlugin found; framework fallback not disabled`);
    }
  }

  return config;
};
