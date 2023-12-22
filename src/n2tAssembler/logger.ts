import { curry } from "../lib/curry";

const LEVELS = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const getLevelValue = (level: Level): number => LEVELS[level];

export type Level = keyof typeof LEVELS;

export type MinLevelSetting = Level | "silent";

export const log = curry(
  (
    level: Level,
    minLevel: MinLevelSetting,
    loggerName: string,
    message: unknown
  ) => {
    if (
      minLevel !== "silent" &&
      getLevelValue(level) >= getLevelValue(minLevel)
    ) {
      console.log(`[${level.toUpperCase()}: ${loggerName}]`, message);
    }
  }
);

export type LogFunction = (message: unknown) => void;

export interface Logger {
  debug: LogFunction;
  info: LogFunction;
  warn: LogFunction;
  error: LogFunction;
}

export const createLogger = (name: string, minLevel: MinLevelSetting) =>
  (Object.keys(LEVELS) as Level[]).reduce(
    (acc, level) => ({
      ...acc,
      [level]: log(level, minLevel, name),
    }),
    {} as Logger
  );
