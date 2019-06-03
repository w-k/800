const path = require("path");

module.exports = {
  mode: "development",
  entry: {
    index: "./src/index.ts"
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js"
  },
  target: "node",
  resolve: {
    extensions: [".ts", ".tsx", ".js"]
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        loader: "ts-loader",
        exclude: /node_modules/
      }
    ]
  }
};
