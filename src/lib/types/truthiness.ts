export type Nullish = null | undefined
export type Bullnean = boolean | Nullish

export type Falsy = false | 0 | "" | Nullish
export type Truthy<T> = T extends Falsy ? never : T
