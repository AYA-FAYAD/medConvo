const { NxWebpackPlugin } = require('@nx/webpack');
const { join } = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  output: {
    path: join(__dirname, '../../dist/apps/med-convo'),
  },
  plugins: [
    new NxWebpackPlugin({
      target: 'node',
      compiler: 'tsc',
      main: './src/index.ts',
      tsConfig: './tsconfig.app.json',
      assets: ['./src/assets'],
      optimization: false,
      outputHashing: 'none',
    }),
    // Add CopyWebpackPlugin to copy non-code files (like views) to the output directory
    new CopyWebpackPlugin({
      patterns: [
        {
          from: './src/views',
          to: 'views', // Destination directory in the output directory
        },
      ],
    }),
  ],
};
