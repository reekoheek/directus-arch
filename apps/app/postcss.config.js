export default {
  plugins: {
    'postcss-import': {},
    'postcss-url': {},
    'postcss-preset-env': {
      features: {
        'nesting-rules': true,
      },
    },
    // '@fullhuman/postcss-purgecss': {
    //   content: [
    //     './index.html',
    //     './src/**/*.ts',
    //   ],
    // },
    // cssnano: {},
  },
};
