// purgecss.config.js
module.exports = {
  content: ["./dist/**/index.html", "./dist/**/*.js"],
  css: ["./dist/**/combined.css"],
  output: "./dist/[FOLDER]/combined.css",
  safelist: [/^swiper/],
};
