/** This file is for example purpose. This file would most likely be named calculate.ts */

export type CalculateAction = "add" | "subtract" | "divide" | "multiply";

const CALCULATE_ACTION_CONFIG: {
  [key in CalculateAction]: (a: number, b: number) => number;
} = {
  add: (a, b) => a + b,
  subtract: (a, b) => a - b,
  divide: (a, b) => a / b,
  multiply: (a, b) => a * b,
} as const;

export interface CalculateOptions {
  a: number;
  b: number;
  action: CalculateAction;
}

export const calculate = ({ a, b, action }: CalculateOptions) =>
  CALCULATE_ACTION_CONFIG[action](a, b);
