module.exports = {
  content: ["../core/**/*.{js,json}", "../module/**/*.{js,json}"],
  theme: {
    extend: {},
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/typography")],
};
