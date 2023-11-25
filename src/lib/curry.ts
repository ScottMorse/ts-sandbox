import {
  AnyFunction,
  PartialParams,
  PartialTuple,
  RemainingParams,
} from "./types";

type CurriedFuncResult<
  Provided extends any[],
  F extends AnyFunction
> = RemainingParams<Provided, Parameters<F>> extends [any, ...any[]]
  ? CurriedFunc<Provided, F>
  : ReturnType<F>;

export type CurriedFunc<ProvidedParams extends any[], F extends AnyFunction> = <
  NewParams extends PartialTuple<RemainingParams<ProvidedParams, Parameters<F>>>
>(
  ...args: NewParams
) => CurriedFuncResult<[...ProvidedParams, ...NewParams], F>;

/** @todo Doc and come up with something about curried funcs accepting `undefined` as an arg  */
export const curry =
  <F extends AnyFunction, InitialParams extends PartialParams<F>>(
    targetFn: F,
    ...initialArgs: InitialParams
  ): CurriedFunc<InitialParams, F> =>
  (...args) => {
    const totalArgs = [...initialArgs, ...args];
    if (totalArgs.length >= targetFn.length) {
      return targetFn(...totalArgs);
    }
    return curry(targetFn, ...(totalArgs as PartialParams<F>)) as any;
  };
