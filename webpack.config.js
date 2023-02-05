const currentTask = process.env.npm_lifecycle_event;
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const path = require('path');
const fse = require('fs-extra');

const config = {
    entry: './app/assets/scripts/App.js',
    plugins: [new HtmlWebpackPlugin({
        filename: 'index.html',
        template: './app/index.html',
        minify: false,
        inject: 'body'
    })],
    module: {
        rules: [
            {
                test: /\.(s(a|c)ss)$/,
                use: [{
                    loader: 'css-loader',
                    options: {
                        url: false
                    }
                }, "sass-loader"]
            }
        ]
    }
}

class RunAfterCompile { // build에서만 적용. 'images들을 퍼블릭용 폴더로 옮기기'
    apply(compiler) {
      compiler.hooks.done.tap('Copy images', () => {
        fse.copySync('./app/assets/images', './docs/assets/images');
      });
    }
  }


if(currentTask == 'dev') {
    config.mode = 'development';
    config.devtool = "eval-source-map";
    config.output = {
        filename: 'bundled.js',
        path: path.resolve(__dirname, 'app')
    },
    config.devServer = {
        watchFiles: ["./app/**/*.html"],
        static: {
            directory: path.join(__dirname, "./app"),
            watch: false,
        },
        hot: true,
        port: 3000,
        headers: {
            "Access-Control-Allow-Origin": "*",
        }
    },
    config.module.rules[0].use.unshift("style-loader");
}

if(currentTask == 'build') {
    config.mode = 'production';
    config.devtool = "source-map";
    config.plugins.push(
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({ filename: 'styles.[chunkhash].css' }),
        new RunAfterCompile()
    );
    config.optimization = {
        splitChunks: { chunks: 'all' }
      };
    config.output = {
        filename: '[name].[chunkhash].js',
        chunkFilename: '[name].[chunkhash].js',
        path: path.resolve(__dirname, './docs')
      }
    config.module.rules[0].use.unshift(MiniCssExtractPlugin.loader);
}

module.exports = config;