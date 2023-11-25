/* Global type declarations. To be used sparingly. */

import { StringKeys } from "./keys"

export {}

type ResolveKeyType<T> = StringKeys<T> extends never ? string : StringKeys<T>

type ResolveEntryType<T> = StringKeys<T> extends never
  ? [string, T[StringKeys<T>] extends never ? T[keyof T] : T[StringKeys<T>]]
  : [
      StringKeys<T>,
      T[StringKeys<T>] extends never ? T[keyof T] : T[StringKeys<T>]
    ]

declare global {
  interface ObjectConstructor {
    keys<T>(o: T): ResolveKeyType<T>[]
    entries<T>(o: T): ResolveEntryType<T>[]
  }
}
