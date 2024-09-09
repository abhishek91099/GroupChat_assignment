export default {
  transform: {
    '^.+\\.m?js$': 'babel-jest',  // Use Babel to transform .js and .mjs files
  },
  testEnvironment: 'node',
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
};
