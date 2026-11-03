const colors = require('./theme/colors.cjs');
const { screens, ...theme } = require('./theme/theme.cjs');

module.exports = {
  content: ['./templates/**/*.html', './*.md'],
  theme: {
    screens,
    extend: {
      ...theme,
      colors,
      borderColor: { DEFAULT: 'currentColor' },
    },
  },
  plugins: [],
};
