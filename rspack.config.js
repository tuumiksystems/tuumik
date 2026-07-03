const { defineConfig } = require('@meteorjs/rspack');
const { DefinePlugin } = require('@rspack/core');
const { VueLoaderPlugin } = require('vue-loader');

/**
 * Rspack configuration for Meteor projects.
 *
 * Provides typed flags on the `Meteor` object, such as:
 * - `Meteor.isClient` / `Meteor.isServer`
 * - `Meteor.isDevelopment` / `Meteor.isProduction`
 * - …and other flags available
 *
 * Use these flags to adjust your build settings based on environment.
 */
module.exports = defineConfig(Meteor => {
  return {
    ...Meteor.isClient && {
      plugins: [
        new VueLoaderPlugin(),
        new DefinePlugin({
          __VUE_OPTIONS_API__: JSON.stringify(false),
          __VUE_PROD_DEVTOOLS__: JSON.stringify(false),
          __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
        }),
      ],
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: {
              // Note, for the majority of features to be available, make sure this option is `true`
              experimentalInlineMatchResource: true,
            },
          },
          {
            test: /\.css$/,
            type: "css",
          },
        ],
      },
    },
  };
});
