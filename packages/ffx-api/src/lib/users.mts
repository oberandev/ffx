import * as Str from "fp-ts/string";
import * as t from "io-ts";
import { Iso } from "monocle-ts";
import { Newtype, iso } from "newtype-ts";

// ==================
//   Runtime codecs
// ==================

export interface UserId extends Newtype<{ readonly UserId: unique symbol }, string> {}

export const isoUserId: Iso<UserId, string> = iso<UserId>();

export const UserIdFromString = new t.Type<UserId>(
  "UserIdFromString",
  (input: unknown): input is UserId => {
    return Str.isString(input) && /^us_usr_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_usr_\w{8}$/g.test(input)
      ? t.success(isoUserId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);
