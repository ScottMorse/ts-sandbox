import { Constructor } from "./class"
import { KeysOfValueType } from "./keys"

export type GlobalThis = typeof globalThis

export type GlobalConstructorKeyName = KeysOfValueType<GlobalThis, Constructor>
