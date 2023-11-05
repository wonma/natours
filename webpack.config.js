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
            { // 순서 중요함. 환경별 코드에서 rules[0]으로 css테스트룰을 reference하고 있음.
                test: /\.s(a|c)ss$/,
                use: [
                    {
                        loader: 'css-loader',
                        options: {
                        url: false
                        }
                    },
                    {
                        loader: 'postcss-loader',
                        options: {
                            sourceMap: true,
                            postcssOptions: {
                                path: 'postcss.config.js'
                            }
                        }
                    },
                    "sass-loader"
                ]
            },
            { 
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                  loader: 'babel-loader',
                  options: {
                    presets: ['@babel/preset-env']
                  }
                }
              },
        ]
    }
}

class RunAfterCompile { // build에서만 적용. 'images들을 퍼블릭용 폴더로 옮기기'
    apply(compiler) {
      compiler.hooks.done.tap('Copy images', () => {
        fse.copySync('./app/assets/images', './docs/assets/images');
      });

      compiler.hooks.done.tap('Copy font folder', () => {
        fse.copySync('./app/assets/fonts', './docs/assets/fonts');
      });
    }
  }


// For dev environment ----------------------------------------------
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


// For production environment ----------------------------------------------
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