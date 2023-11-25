export type AnyArray<T = any> = Array<T> | ReadonlyArray<T>
export type ArrayItem<A extends AnyArray> = A[number]
export type AnyArrayWrapper<T extends AnyArray> = T | Readonly<T>

export type PartialTuple<
  Tuple extends AnyArray,
  Extracted extends AnyArray = []
> = Tuple extends AnyArrayWrapper<[infer Next, ...infer Rest]>
  ? PartialTuple<Rest, [...Extracted, Next?]>
  : [...Extracted, ...Tuple]

export type {
  OptionalArray,
  ResolvedOptionalArray,
  ResolvedOptionalArrayItem,
} from "../array/optionalArray"
