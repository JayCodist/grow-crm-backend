/**
 * Makes all properties in T optional, property values are the supplied type (optional) or `any`
 */
export type PartialLoose<T, V = any> = {
  [P in keyof T]?: V;
};
