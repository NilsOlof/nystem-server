import plugin from "@tailwindcss/plugin";
import forms from "@tailwindcss/forms";

export default {
  content: ["../core/**/*.{js,json}", "../module/**/*.{js,json}"],
  theme: {
    extend: {},
  },
  plugins: [
    // eslint-disable-next-line prefer-arrow-callback
    plugin(function ({ addVariant }) {
      addVariant("active", "&.active");
    }),
    plugin,
    forms,
  ],
};
