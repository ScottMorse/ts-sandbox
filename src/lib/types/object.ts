export type Overwrite<T, U> = Omit<T, keyof U> & U

export type AnyObject = Record<string | number | symbol, any>

type Impossible<K extends keyof any> = {
  [P in K]: never
}

export type NoExtraProperties<T, U extends T = T> = U &
  Impossible<Exclude<keyof U, keyof T>>

export type CannotOverlap<T, U> = {
  [L in Exclude<keyof T, keyof U>]: T[L]
}

/** Same base functionality as Pick, but the given keys do not have to be in the object type */
export type PickAny<T, K extends string | number | symbol> = Pick<
  T,
  { [P in keyof T]: P extends K ? P : never }[keyof T]
>
