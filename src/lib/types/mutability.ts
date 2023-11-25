export type Mutable<T, Deep extends boolean = false> = T extends {
  [key: string | number | symbol]: any
}
  ? {
      -readonly [Key in keyof T]: Deep extends true ? Mutable<T[Key]> : T[Key]
    }
  : T
