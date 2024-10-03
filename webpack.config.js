const path = require("path");
const webpack = require("webpack");

module.exports = {
  mode: "development",
  target: "node",
  entry: "./app.js",
  output: {
    path: path.resolve(__dirname, "public"),
    filename: "bundle.js",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
  devtool: "inline-source-map",
};
