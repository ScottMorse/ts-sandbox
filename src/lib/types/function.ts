import { AnyArrayWrapper, PartialTuple } from "./array"

export type Func<Args extends any[] = any[], Return = any> = (
  ...args: Args
) => Return

export type AnyFunction = Func

export type AsyncFunc<
  Args extends any[] = any[],
  Return extends Promise<any> = Promise<any>
> = Func<Args, Return>

export type AnyAsyncFunc = AsyncFunc

/** An optional length tuple of a function's parameters */
export type PartialParams<T extends AnyFunction> =
  | PartialTuple<Parameters<T>>
  | []

/**
 * For a given tuple of parameters of any length,
 * get an array of remaining parameters not yet provided
 * for a given function type (or you can provide an array type
 * as the expected parameters directly)
 */
export type RemainingParams<
  Provided extends any[],
  Expected extends any[]
> = Expected extends AnyArrayWrapper<[infer _, ...infer RestExpected]>
  ? Provided extends AnyArrayWrapper<[infer _, ...infer RestProvided]>
    ? RemainingParams<RestProvided, RestExpected>
    : Expected
  : []

export type EmptyFunction = () => void
