declare const brand: unique symbol

/**
 * Wrap a type in a brand. This makes the type opaque, or nominal, meaning
 * that a type must be cast to the branded type to be used properly.
 *
 * You can brand, say, the `string` type so that only the string of
 * some function's result can be used:
 *
 * @example
 * type BrandedString = Branded<string, "MyBrand">
 *
 * const brandMyString = <T extends string>(str: T): BrandedString => ('BOOM BRANDED' + str) as BrandedString
 *
 * const printBrandedString = (str: BrandedString) => console.log(str)
 *
 * printBrandedString(brandMyString('hello')) // OK
 * printBrandedString('hello' as BrandedString) // OK
 * printBrandedString('hello') // ERROR
 */
export type Branded<T = any, BrandName extends string = string> = T & {
  [brand]: BrandName
}
