import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import mkApiClient from "../src/index.mjs";
import { Workbook, WorkbookCodec } from "../src/lib/workbooks.mjs";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

function _mkMockWorkbook(): IO.IO<Workbook> {
  return IO.of({
    id: `us_wb_${randomId()()}`,
    actions: [],
    createdAt: faker.date.past().toISOString(),
    environmentId: `us_env_${randomId()()}`,
    labels: [faker.lorem.word()],
    metadata: {},
    name: faker.lorem.word(),
    namespace: faker.lorem.word(),
    sheets: [],
    spaceId: `us_sp_${randomId()()}`,
    updatedAt: faker.date.past().toISOString(),
  });
}

describe("sheets", () => {
  describe("[Decoders]", () => {
    it("Sheet", () => {
      const decoded = pipe(_mkMockWorkbook()(), WorkbookCodec.decode);

      expect(E.isRight(decoded)).toBe(true);
    });
  });
});
