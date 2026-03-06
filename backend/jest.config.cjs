// module.exports = {
//   testEnvironment: "node",
//   transform: {
//     "^.+\\.js$": "babel-jest"
//   },
//   setupFiles: ["<rootDir>/tests/setupTests.js"], 
// };

module.exports = {
  testEnvironment: "node",
  transform: {},
  testMatch: ["**/tests/**/*.test.js"],
  setupFiles: ["<rootDir>/tests/setupTests.js"]
};