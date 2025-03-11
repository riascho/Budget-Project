const config = {
  verbose: true,
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
  roots: ["<rootDir>/src"],
};

module.exports = config;
