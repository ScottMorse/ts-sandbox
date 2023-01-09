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

/**
 * Given two numbers `a` and `b`, calculate an operation on them,
 * `a` being the first operator, and `b` being the second operator.
 *
 * @example
 * calculate({ a: 1, b: 2, action: "add" }) // 3
 * calculate({ a: 1, b: 2, action: "subtract" }) // -1
 * calculate({ a: 1, b: 2, action: "divide" }) // 0.5
 * calculate({ a: 1, b: 2, action: "multiply" }) // 2
 */
export const calculate = ({ a, b, action }: CalculateOptions) =>
  CALCULATE_ACTION_CONFIG[action](a, b);
