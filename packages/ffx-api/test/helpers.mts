import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";

import mkApiClient from "../src/index.mjs";
import {
  AccountId,
  AgentId,
  DocumentId,
  EnvironmentId,
  SecretId,
  SheetId,
  SpaceId,
  UserId,
  VersionId,
  WorkbookId,
  isoAccountId,
  isoAgentId,
  isoDocumentId,
  isoEnvironmentId,
  isoSecretId,
  isoSheetId,
  isoSpaceId,
  isoUserId,
  isoVersionId,
  isoWorkbookId,
} from "../src/lib/ids.mjs";

export const client = mkApiClient("secret", mkEnvironmentId()());
export const baseUrl: string = "https://platform.flatfile.com/api/v1";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

export function mkAccountId(): IO.IO<AccountId> {
  return pipe(
    randomId(),
    IO.map((random) => isoAccountId.wrap(`us_acc_${random}`)),
  );
}

export function mkAgentId(): IO.IO<AgentId> {
  return pipe(
    randomId(),
    IO.map((random) => isoAgentId.wrap(`us_ag_${random}`)),
  );
}

export function mkDocumentId(): IO.IO<DocumentId> {
  return pipe(
    randomId(),
    IO.map((random) => isoDocumentId.wrap(`us_dc_${random}`)),
  );
}

export function mkEnvironmentId(): IO.IO<EnvironmentId> {
  return pipe(
    randomId(),
    IO.map((random) => isoEnvironmentId.wrap(`us_env_${random}`)),
  );
}

export function mkSecretId(): IO.IO<SecretId> {
  return pipe(
    randomId(),
    IO.map((random) => isoSecretId.wrap(`us_sec_${random}`)),
  );
}

export function mkSheetId(): IO.IO<SheetId> {
  return pipe(
    randomId(),
    IO.map((random) => isoSheetId.wrap(`us_sh_${random}`)),
  );
}

export function mkSpaceId(): IO.IO<SpaceId> {
  return pipe(
    randomId(),
    IO.map((random) => isoSpaceId.wrap(`us_sp_${random}`)),
  );
}

export function mkUserId(): IO.IO<UserId> {
  return pipe(
    randomId(),
    IO.map((random) => isoUserId.wrap(`us_usr_${random}`)),
  );
}

export function mkVersionId(): IO.IO<VersionId> {
  return pipe(
    randomId(),
    IO.map((random) => isoVersionId.wrap(`us_vr_${random}`)),
  );
}

export function mkWorkbookId(): IO.IO<WorkbookId> {
  return pipe(
    randomId(),
    IO.map((random) => isoWorkbookId.wrap(`us_wb_${random}`)),
  );
}
