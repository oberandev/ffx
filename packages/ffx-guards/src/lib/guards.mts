// ===================
//       Types
// ===================

type Nil = null | undefined;

export type Nullable<T> = T | null;

type Falsy = null | undefined | false | 0;

// ===================
//       Guards
// ===================

/**
 * Helper function to determine if a value is `null`.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isNull(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isNull = (x: unknown): x is null => x === null;

/**
 * Helper function to determine if a value is `undefined`.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isUndefined(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isUndefined = (x: unknown): x is undefined => x === undefined;

/**
 * Helper function to determine if a value is `null`, `undefined` or an empty string.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isNil(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isNil = (x: unknown): x is Nil => isNull(x) || isUndefined(x);

/**
 * Helper function to determine if a value is NOT `null` or `undefined`.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isNotNil(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isNotNil = <T,>(x: T | Nil): x is T => !isNil(x);

/**
 * Helper function to determine if a value is falsy.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isFalsy(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isFalsy = (x: unknown): x is Falsy =>
  x === 0 || Number.isNaN(x) || x === false || isNil(x);

/**
 * Helper function to determine if a value is truthy.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isTruthy(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isTruthy = (x: unknown): x is true => !isFalsy(x);

/**
 * Helper function to determine if a value is a string.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isString(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isString = (x: unknown): x is string => typeof x === "string";

/**
 * Helper function to determine if a value is a number.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isNumber(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isNumber = (x: unknown): x is number => typeof x === "number";

/**
 * Helper function to determine if a value is a date.
 * Useful in if/else statements or ternaries.
 *
 * @example
 *
 * ```ts
 * if (isDate(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isDate = (x: unknown): x is Date => x instanceof Date;

/**
 * Helper function to determine if a value is an array.
 * Useful in if/else statements or ternaries.
 *
 * Note: Does not verify that each value in the array is of type T
 * since the type system does not exist at _runtime_.
 *
 * @example
 *
 * ```ts
 * if (isArray<string>(x)) {
 *   ...
 * } else {
 *   ...
 * }
 * ```
 *
 * @since 0.1.0
 */
export const isArray = (x: unknown) => Array.isArray(x);
