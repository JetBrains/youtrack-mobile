module.exports = {
    debug: true,
    devtool: 'source-map',
    entry: {
        'index.ios': ['./index.ios.js'],
        'index.android': ['./index.android.js']
    },
    output: {
        path: require('path').resolve(__dirname, 'build'),
        filename: '[name].js'
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx|es6)$/,
                loader: 'babel',
                query: {
                    cacheDirectory: true,
                    presets: ['es2015', 'stage-1', 'react']
                }
            }
        ]
    }
};
