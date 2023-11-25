interface JSTypeToBuiltInMap {
  string: string
  number: number
  boolean: boolean
  undefined: undefined
  function: (...args: any[]) => any
  object: null | object
  symbol: symbol
}

export type JSDataType<T = any> = {
  [K in keyof JSTypeToBuiltInMap]: K extends "object"
    ? // fixes fact that all function types are assinable to the object type
      T extends (...args: any[]) => any
      ? never
      : T extends JSTypeToBuiltInMap[K]
      ? K
      : never
    : T extends JSTypeToBuiltInMap[K]
    ? K
    : never
}[keyof JSTypeToBuiltInMap]

export type JSDataTypeBuiltIn<T extends JSDataType = JSDataType> =
  JSTypeToBuiltInMap[T]
