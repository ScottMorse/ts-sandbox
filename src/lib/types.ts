export type DeeplyPartial<T> = {
  [P in keyof T]?: DeeplyPartial<T[P]>;
};
