export type KeysOfType<
  Type,
  KeyType extends string | number | symbol
> = Extract<keyof Type, KeyType>
export type StringKeys<Type> = KeysOfType<Type, string>
export type NumberKeys<Type> = KeysOfType<Type, number>
export type SymbolKeys<Type> = KeysOfType<Type, symbol>

export type KeysOfValueType<T, V> = Exclude<
  {
    [K in keyof T]: T[K] extends V ? K : never
  }[keyof T],
  undefined
>
