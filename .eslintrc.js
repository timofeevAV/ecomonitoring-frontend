module.exports = {
  root: true,
  extends: ['universe/native', 'prettier'],
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 'error',
  },
  parserOptions: {
    warnOnUnsupportedTypeScriptVersion: false,
  },
};
