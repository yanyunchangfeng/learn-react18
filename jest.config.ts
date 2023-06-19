import type { Config } from "jest";
import { defaults as tsjPreset } from "ts-jest/presets";

const config: Config = {
  testEnvironment: "node",
  collectCoverage: true,
  transform: {
    ...tsjPreset.transform,
    "/test/.*\\.spec\\.tsx?$": [
      "ts-jest",
      {
        tsconfig: { emitDecoratorMetadata: true, experimentalDecorators: true },
      },
    ],
  },
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1",
  },
  coverageReporters: ["lcov", "html"],
  testRegex: "/test/.*\\.spec\\.tsx?$",
  collectCoverageFrom: ["src/**/*"],
};

export default config;
