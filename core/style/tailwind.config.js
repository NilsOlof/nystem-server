const plugin = require("tailwindcss/plugin");

module.exports = {
  content: ["../core/**/*.{js,json}", "../module/**/*.{js,json}"],
  theme: {
    extend: {},
  },
  plugins: [
    // eslint-disable-next-line prefer-arrow-callback
    plugin(function ({ addVariant }) {
      addVariant("active", "&.active");
    }),
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography"),
  ],
};
