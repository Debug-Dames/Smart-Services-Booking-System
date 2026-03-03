module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest"
  },
  setupFiles: ["<rootDir>/tests/setupTests.js"], 
};