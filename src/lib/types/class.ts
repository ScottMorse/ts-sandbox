type FunctionProps = {
  name?: string
}

export type ConcreteConstructor<
  Args extends any[] = any[],
  Instance = any
> = FunctionProps & (new (...args: Args) => Instance)

export type AbstractConstructor<
  Args extends any[] = any[],
  Instance = any
> = FunctionProps & (abstract new (...args: Args) => Instance)

export type ConstructorKind = "abstract" | "concrete"

/**
 *  The type of an un-instantiated class.
 *
 *  Note that this allows for either an abstract or concrete constructor,
 *  so separate types are available for only those.
 */
export type Constructor<
  Args extends any[] = any[],
  Instance = any,
  Kind extends ConstructorKind = ConstructorKind
> = Kind extends "abstract"
  ? Kind extends "concrete"
    ? AbstractConstructor<Args, Instance> | ConcreteConstructor<Args, Instance>
    : AbstractConstructor<Args, Instance>
  : ConcreteConstructor<Args, Instance>
