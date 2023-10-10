import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import mkApiClient from "../src/index.mjs";
import { SpaceIdCodec } from "../src/lib/documents.mjs";
import { EnvironmentIdCodec } from "../src/lib/environments.mjs";
import { Workbook, WorkbookCodec, WorkbookIdCodec } from "../src/lib/workbooks.mjs";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

function _mkMockWorkbook(): IO.IO<Workbook> {
  return IO.of({
    id: WorkbookIdCodec.encode(`us_wb_${randomId()()}`),
    actions: [],
    createdAt: faker.date.past().toISOString(),
    environmentId: EnvironmentIdCodec.encode(`us_env_${randomId()()}`),
    labels: [faker.lorem.word()],
    metadata: {},
    name: faker.lorem.word(),
    namespace: faker.lorem.word(),
    sheets: [],
    spaceId: SpaceIdCodec.encode(`us_sp_${randomId()()}`),
    updatedAt: faker.date.past().toISOString(),
  });
}

describe("sheets", () => {
  describe("[Codecs]", () => {
    it("Sheet", () => {
      const decoded = pipe(_mkMockWorkbook()(), WorkbookCodec.decode);

      expect(E.isRight(decoded)).toBe(true);
    });

    it("WorkbookId", () => {
      const encoded = WorkbookIdCodec.encode(`us_wb_${randomId()()}`);

      expect(WorkbookIdCodec.is(encoded)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    const secret: string = "secret";
    const environmentId: string = "environmentId";
    const client = mkApiClient(secret, environmentId);
    const baseUrl: string = "https://platform.flatfile.com/api/v1";

    it("should pass", () => {
      expect(true).toBe(true);
    });
  });
});
