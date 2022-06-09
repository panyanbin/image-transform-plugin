module.exports = {
  env: {
    node: true,
    es2021: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint"],
  extends: ["plugin:prettier/recommended", "prettier", "plugin:@typescript-eslint/recommended"],
};
