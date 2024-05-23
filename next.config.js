const withSass = require('@zeit/next-sass')
const webpack = require('webpack')
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const PreloadWebpackPlugin = require('preload-webpack-plugin');
const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
const SWPrecacheWebpackPlugin = require('sw-precache-webpack-plugin')
module.exports = withSass({
    minified:true,
    webpack: config => {


        // config.plugins.push(
        //   new SWPrecacheWebpackPlugin({
        //     cacheId: 'JETBULL_PRE_PROD',
        //     filepath: path.resolve('./static/sw.js'),
        //     staticFileGlobs: [
        //       'static/**/*'
        //     ],
        //     minify: true,
        //     staticFileGlobsIgnorePatterns: [/\.next\//],
        //     runtimeCaching: [{
        //         handler: 'fastest',
        //         urlPattern: /[.](png|jpg|css)/
        //       },{
        //         handler: 'networkFirst',
        //         urlPattern: /^https?.*/
        //       }]
        //   })
        // )


        config.plugins.push(
            new webpack.optimize.LimitChunkCountPlugin({
               maxChunks: 1,
            })
         )

         config.plugins.push(
            new webpack.ContextReplacementPlugin(
                /moment[\/\\]locale$/,
                /de|en-gb|ru/
              )
         )

         config.plugins.push(
          new webpack.NormalModuleReplacementPlugin(
            /moment\/min\/locales/, path.resolve(__dirname, 'vendor/locales.js')
           )
        )

        //  config.plugins.push(
        //     new BundleAnalyzerPlugin({
        //         analyzerMode: 'static', // disabled, static
        //         generateStatsFile: true,
        //         statsOptions: { source: false },
        //         analyzerPort: 4000,
        //       })
        //  )

        config.optimization.minimizer.push(
          new OptimizeCSSAssetsPlugin({
            cssProcessorPluginOptions: {
              preset: ['default', { discardComments: { removeAll: true } }],
            },
            canPrint: true
          })
        )

        config.plugins.push(
          new HtmlWebpackPlugin()
        )

        config.plugins.push(
          new PreloadWebpackPlugin({
            rel: 'preload',
            as(entry) {
              if (/\.css$/.test(entry)) return 'style';
              if (/\.woff$/.test(entry)) return 'font';
              if (/\.png$/.test(entry)) return 'image';
            }
          })
        )

        // config.optimization.minimizer.push(new OptimizeCSSAssetsPlugin({}));
        
        return config
      }
})
