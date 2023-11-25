export type LowerAlphaChar =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l"
  | "m"
  | "n"
  | "o"
  | "p"
  | "q"
  | "r"
  | "s"
  | "t"
  | "u"
  | "v"
  | "w"
  | "x"
  | "y"
  | "z"

export type UpperAlphaChar =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"

export type CharCasingOption = "upper" | "lower"

export type AlphaChar<Casing extends CharCasingOption = CharCasingOption> =
  Casing extends "upper"
    ? Casing extends "lower"
      ? UpperAlphaChar | LowerAlphaChar
      : UpperAlphaChar
    : LowerAlphaChar

export type DigitChar =
  | "0"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"

export type AlphaNumericChar<
  Casing extends CharCasingOption = CharCasingOption
> = AlphaChar<Casing> | DigitChar

export type UpperHexDigit = DigitChar | "A" | "B" | "C" | "D" | "E" | "F"

export type LowerHexDigit = DigitChar | "a" | "b" | "c" | "d" | "e" | "f"

export type HexDigit<Casing extends CharCasingOption = CharCasingOption> =
  Casing extends "upper"
    ? Casing extends "lower"
      ? LowerHexDigit | UpperHexDigit
      : UpperHexDigit
    : LowerHexDigit
