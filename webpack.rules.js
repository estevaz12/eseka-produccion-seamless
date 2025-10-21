const {
  defineReactCompilerLoaderOption,
  reactCompilerLoader,
} = require('react-compiler-webpack');

module.exports = [
  // Add support for native node modules
  {
    // We're specifying native_modules in the test because the asset relocator loader generates a
    // "fake" .node file which is really a cjs file.
    test: /native_modules[/\\].+\.node$/,
    use: 'node-loader',
  },
  {
    test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
    parser: { amd: false },
    use: {
      loader: '@vercel/webpack-asset-relocator-loader',
      options: {
        outputAssetBase: 'native_modules',
      },
    },
  },
  {
    test: /\.jsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [['@babel/preset-react', { runtime: 'automatic' }]],
        },
      },
      {
        loader: reactCompilerLoader,
        options: defineReactCompilerLoaderOption({
          // React Compiler options goes here
        }),
      },
    ],
  },
  {
    test: /\.tsx?$/,
    exclude: /node_modules/,
    use: [
      {
        loader: 'ts-loader', 
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  {
    test: /\.(png|jpe?g|gif|svg)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'assets/images/[name][contenthash][ext]',
    },
  },
  {
    test: /\.(wav|mp3|ogg)$/i,
    type: 'asset/resource',
    generator: {
      filename: 'assets/sounds/[name][contenthash][ext]',
    },
  },

  // Put your webpack loader rules in this array.  This is where you would put
  // your ts-loader configuration for instance:
  /**
   * Typescript Example:
   *
   * {
   *   test: /\.tsx?$/,
   *   exclude: /(node_modules|.webpack)/,
   *   loaders: [{
   *     loader: 'ts-loader',
   *     options: {
   *       transpileOnly: true
   *     }
   *   }]
   * }
   */
];
