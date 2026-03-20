// module.exports = {
//   testEnvironment: "node",
//   transform: {
//     "^.+\\.js$": "babel-jest"
//   },
//   setupFiles: ["<rootDir>/tests/setupTests.js"],
// };

// module.exports = {
//   testEnvironment: "node",
//   transform: {},
//   testMatch: ["**/tests/**/*.test.js"],
//   setupFiles: ["<rootDir>/tests/setupTests.js"]
// };

export default {
  testEnvironment: "node",
  transform: {},
  // extensionsToTreatAsEsm: [".js"],
  setupFiles: ["./tests/setupTests.js"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1"
  },
  testTimeout: 20000 // default timeout for all tests
};
