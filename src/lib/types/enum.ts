/** @todo comment and example */
export type ValidatedTypeEnum<
  TypeEnum extends AbstractEnum,
  AbstractEnum extends { [key: string]: unknown }
> = TypeEnum
