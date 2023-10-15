import { faker } from "@faker-js/faker";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import * as RA from "fp-ts/ReadonlyArray";

import mkApiClient from "../src/index.mjs";
import {
  AccountId,
  AgentId,
  DocumentId,
  EnvironmentId,
  EventId,
  FileId,
  GuestId,
  JobId,
  RecordId,
  SecretId,
  SheetId,
  SnapshotId,
  SpaceId,
  UserId,
  VersionId,
  WorkbookId,
  isoAccountId,
  isoAgentId,
  isoDocumentId,
  isoEnvironmentId,
  isoEventId,
  isoFileId,
  isoGuestId,
  isoJobId,
  isoRecordId,
  isoSecretId,
  isoSheetId,
  isoSnapshotId,
  isoSpaceId,
  isoUserId,
  isoVersionId,
  isoWorkbookId,
} from "../src/lib/ids.mjs";

export const client = mkApiClient("secret");
export const baseUrl: string = "https://platform.flatfile.com/api/v1";

export const maybePresent = faker.helpers.maybe;
export const multipleOf = faker.helpers.arrayElements;
export const oneOf = faker.helpers.arrayElement;

function randomId(length: number): IO.IO<string> {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  return IO.of(
    pipe(
      RA.replicate(length, ""),
      RA.map(() => characters.charAt(Math.floor(Math.random() * characters.length))),
      (chars) => chars.join(""),
    ),
  );
}

export function mkAccountId(): IO.IO<AccountId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoAccountId.wrap(`us_acc_${random}`)),
  );
}

export function mkAgentId(): IO.IO<AgentId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoAgentId.wrap(`us_ag_${random}`)),
  );
}

export function mkDocumentId(): IO.IO<DocumentId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoDocumentId.wrap(`us_dc_${random}`)),
  );
}

export function mkEnvironmentId(): IO.IO<EnvironmentId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoEnvironmentId.wrap(`us_env_${random}`)),
  );
}

export function mkEventId(): IO.IO<EventId> {
  return pipe(
    randomId(16),
    IO.map((random) => isoEventId.wrap(`us_evt_${random}`)),
  );
}

export function mkFileId(): IO.IO<FileId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoFileId.wrap(`us_fl_${random}`)),
  );
}

export function mkGuestId(): IO.IO<GuestId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoGuestId.wrap(`us_g_${random}`)),
  );
}

export function mkJobId(): IO.IO<JobId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoJobId.wrap(`us_jb_${random}`)),
  );
}

export function mkRecordId(): IO.IO<RecordId> {
  return pipe(
    randomId(16),
    IO.map((random) => isoRecordId.wrap(`us_rc_${random}`)),
  );
}

export function mkSecretId(): IO.IO<SecretId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoSecretId.wrap(`us_sec_${random}`)),
  );
}

export function mkSheetId(): IO.IO<SheetId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoSheetId.wrap(`us_sh_${random}`)),
  );
}

export function mkSnapshotId(): IO.IO<SnapshotId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoSnapshotId.wrap(`us_ss_${random}`)),
  );
}

export function mkSpaceId(): IO.IO<SpaceId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoSpaceId.wrap(`us_sp_${random}`)),
  );
}

export function mkUserId(): IO.IO<UserId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoUserId.wrap(`us_usr_${random}`)),
  );
}

export function mkVersionId(): IO.IO<VersionId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoVersionId.wrap(`us_vr_${random}`)),
  );
}

export function mkWorkbookId(): IO.IO<WorkbookId> {
  return pipe(
    randomId(8),
    IO.map((random) => isoWorkbookId.wrap(`us_wb_${random}`)),
  );
}
