const resolve = require('path').resolve;
const webpack = require('webpack');

module.exports = async ({ config, mode }) => {
    // `mode` has a value of 'DEVELOPMENT' or 'PRODUCTION'
    // You can change the configuration based on that.
    // 'PRODUCTION' is used when building the static version of storybook.

    // Make whatever fine-grained changes you need
    config.module.rules.push({
        test: /\.less$/,
        use: [
            {
                loader: 'style-loader',
            },{
                loader: 'css-loader',
            },{
                loader: 'less-loader',
                options: {
                    javascriptEnabled: true,
                },
            },
        ]
    });

    // allows loading icon fonts imported in main.less
    config.module.rules.push({
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loaders: ['file-loader'],
        include: resolve(__dirname, '../'),
    });

    config.plugins = [
        ...(config.plugins || []),
        new webpack.NormalModuleReplacementPlugin(
            /scopes/,
            resolve(__dirname, './emptyMethods'),
        ),
        new webpack.NormalModuleReplacementPlugin(
            /meteor\/meteor/,
            resolve(__dirname, './emptyMethods'),
        ),
        new webpack.NormalModuleReplacementPlugin(
            /NluModalContent\.jsx/,
            `${__dirname}/EmptyComponent.jsx`,
        ),
    ]
    
    // Return the altered config
    return config;
};
