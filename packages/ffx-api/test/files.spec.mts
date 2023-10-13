import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import {
  baseUrl,
  client,
  maybePresent,
  mkFileId,
  mkSheetId,
  mkSpaceId,
  mkWorkbookId,
  oneOf,
} from "./helpers.mjs";
import { File } from "../src/lib/files.mjs";

function _mkMockFile(): IO.IO<File> {
  return IO.of({
    id: mkFileId()(),
    actions: maybePresent(() => []),
    bytesReceived: faker.number.int(),
    createdAt: faker.date.past(),
    encoding: faker.lorem.word(),
    ext: faker.lorem.word(),
    mimetype: faker.lorem.word(),
    mode: oneOf(["export", "import"]),
    name: faker.lorem.word(),
    sheetId: maybePresent(() => mkSheetId()()),
    size: faker.number.int(),
    spaceId: mkSpaceId()(),
    status: oneOf(["archived", "complete", "failed", "partial", "purged"]),
    updatedAt: faker.date.past(),
    workbookId: maybePresent(() => mkWorkbookId()()),
  });
}

describe("files", () => {
  it("asdf", () => {});
});
