import * as Str from "fp-ts/string";
import * as t from "io-ts";
import { Iso } from "monocle-ts";
import { Newtype, iso } from "newtype-ts";

export interface AccountId extends Newtype<{ readonly AccountId: unique symbol }, string> {}

export const isoAccountId: Iso<AccountId, string> = iso<AccountId>();

export const AccountIdFromString = new t.Type<AccountId>(
  "AccountIdFromString",
  (input: unknown): input is AccountId => {
    return Str.isString(input) && /^us_acc_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_acc_\w{8}$/g.test(input)
      ? t.success(isoAccountId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface AgentId extends Newtype<{ readonly AgentId: unique symbol }, string> {}

export const isoAgentId: Iso<AgentId, string> = iso<AgentId>();

export const AgentIdFromString = new t.Type<AgentId>(
  "AgentIdFromString",
  (input: unknown): input is AgentId => {
    return Str.isString(input) && /^us_ag_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_ag_\w{8}$/g.test(input)
      ? t.success(isoAgentId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface DocumentId extends Newtype<{ readonly DocumentId: unique symbol }, string> {}

export const isoDocumentId: Iso<DocumentId, string> = iso<DocumentId>();

export const DocumentIdFromString = new t.Type<DocumentId>(
  "DocumentIdFromString",
  (input: unknown): input is DocumentId => {
    return Str.isString(input) && /^us_dc_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_dc_\w{8}$/g.test(input)
      ? t.success(isoDocumentId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface EnvironmentId extends Newtype<{ readonly EnvironmentId: unique symbol }, string> {}

export const isoEnvironmentId: Iso<EnvironmentId, string> = iso<EnvironmentId>();

export const EnvironmentIdFromString = new t.Type<EnvironmentId>(
  "EnvironmentIdFromString",
  (input: unknown): input is EnvironmentId => {
    return Str.isString(input) && /^us_env_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_env_\w{8}$/g.test(input)
      ? t.success(isoEnvironmentId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface SecretId extends Newtype<{ readonly SecretId: unique symbol }, string> {}

export const isoSecretId: Iso<SecretId, string> = iso<SecretId>();

export const SecretIdFromString = new t.Type<SecretId>(
  "SecretIdFromString",
  (input: unknown): input is SecretId => {
    return Str.isString(input) && /^us_sec_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_sec_\w{8}$/g.test(input)
      ? t.success(isoSecretId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface SheetId extends Newtype<{ readonly SheetId: unique symbol }, string> {}

export const isoSheetId: Iso<SheetId, string> = iso<SheetId>();

export const SheetIdFromString = new t.Type<SheetId>(
  "SheetIdFromString",
  (input: unknown): input is SheetId => {
    return Str.isString(input) && /^us_sh_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_sh_\w{8}$/g.test(input)
      ? t.success(isoSheetId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface SpaceId extends Newtype<{ readonly SpaceId: unique symbol }, string> {}

export const isoSpaceId: Iso<SpaceId, string> = iso<SpaceId>();

export const SpaceIdFromString = new t.Type<SpaceId>(
  "SpaceIdFromString",
  (input: unknown): input is SpaceId => {
    return Str.isString(input) && /^us_sp_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_sp_\w{8}$/g.test(input)
      ? t.success(isoSpaceId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

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

export interface VersionId extends Newtype<{ readonly VersionId: unique symbol }, string> {}

export const isoVersionId: Iso<VersionId, string> = iso<VersionId>();

export const VersionIdFromString = new t.Type<VersionId>(
  "VersionIdFromString",
  (input: unknown): input is VersionId => {
    return Str.isString(input) && /^us_vr_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_vr_\w{8}$/g.test(input)
      ? t.success(isoVersionId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface WorkbookId extends Newtype<{ readonly WorkbookId: unique symbol }, string> {}

export const isoWorkbookId: Iso<WorkbookId, string> = iso<WorkbookId>();

export const WorkbookIdFromString = new t.Type<WorkbookId>(
  "WorkbookIdFromString",
  (input: unknown): input is WorkbookId => {
    return Str.isString(input) && /^us_wb_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_wb_\w{8}$/g.test(input)
      ? t.success(isoWorkbookId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);
