/* Minimal modern Babel config for validated-changeset-webforms
	 - Supports modern JS and TypeScript
	 - Uses @babel/preset-env and @babel/preset-typescript
	 - Adds plugin-transform-runtime to avoid polluting globals
	 - Keeps configuration simple so ESLint can parse source files
*/
'use strict';

module.exports = function (api) {
  api.cache(true);

  return {
    presets: [
      [
        require.resolve('@babel/preset-env'),
        {
          targets: { node: '14' },
          modules: false,
          useBuiltIns: false,
        },
      ],
      require.resolve('@babel/preset-typescript'),
    ],
    plugins: [
      [
        require.resolve('@babel/plugin-transform-runtime'),
        {
          regenerator: true,
        },
      ],
    ],
  };
};
