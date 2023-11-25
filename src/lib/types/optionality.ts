import { Constructor } from "./class"
import { AnyObject } from "./object"

/** Makes the passed type possibly `undefined` */
export type Optional<T> = T | undefined

/** Given keys are required, rest are unchanged (inverse of PartiallyOptional) */
export type PartiallyRequired<T, K extends keyof T> = Omit<T, K> &
  Required<Pick<T, K>>

/** Given keys are optional, rest are unchanged (inverse of PartiallyRequired) */
export type PartiallyOptional<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>

/** Given keys are required, rest are optional (inverse of OnlyOptional) */
export type OnlyRequire<T, K extends keyof T> = Required<Pick<T, K>> &
  Partial<Omit<T, K>>

/** Given keys are optional, rest are required (inverse of OnlyRequire) */
export type OnlyOptional<T, K extends keyof T> = Partial<Pick<T, K>> &
  Required<Omit<T, K>>

/** All fields are required deeply */
export type DeeplyRequired<T> = T extends {
  [key: string | number | symbol]: any
}
  ? {
      [K in keyof Required<T>]: Required<T>[K] extends Constructor
        ? Required<T>[K]
        : DeeplyRequired<Required<T>[K]>
    }
  : T

/** All fields are optional deeply  */
export type DeeplyPartial<T> = T extends AnyObject
  ? {
      [K in keyof T]?: DeeplyPartial<T[K]>
    }
  : T
