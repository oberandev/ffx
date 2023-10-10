import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import mkApiClient from "../src/index.mjs";
import { CreateSheetInput, Sheet, SheetCodec } from "../src/lib/sheets.mjs";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

function _mkMockSheet(): IO.IO<Sheet> {
  return IO.of({
    id: `us_sh_${randomId()()}`,
    config: {
      access: faker.helpers.arrayElements(["*", "add", "delete", "edit", "import"]),
      actions: [
        {
          confirm: faker.helpers.arrayElement([false, true]),
          description: faker.lorem.words(3),
          icon: faker.lorem.word(),
          inputForm: {
            fields: [
              {
                config: {
                  options: {
                    color: faker.lorem.word(),
                    description: faker.lorem.words(3),
                    icon: faker.lorem.word(),
                    label: faker.lorem.word(),
                    meta: {},
                    value: faker.helpers.arrayElement([
                      faker.helpers.arrayElement([false, true]),
                      faker.number.int(),
                      faker.lorem.word(),
                    ]),
                  },
                },
                constraints: [{ type: "required" }],
                description: faker.lorem.words(3),
                key: faker.lorem.word(),
                label: faker.lorem.word(),
                type: faker.helpers.arrayElement([
                  "boolean",
                  "enum",
                  "number",
                  "string",
                  "textarea",
                ]),
              },
            ],
            type: "simple",
          },
          label: faker.lorem.word(),
          mode: faker.helpers.arrayElement(["background", "foreground"]),
          operation: faker.lorem.word(),
          primary: faker.helpers.arrayElement([false, true]),
          requireAllValid: faker.helpers.arrayElement([false, true]),
          requireSelection: faker.helpers.arrayElement([false, true]),
          schedule: faker.helpers.arrayElement(["daily", "hourly", "weekly"]),
          tooltip: faker.lorem.word(),
        },
      ],
      allowAdditionalFields: faker.helpers.arrayElement([false, true]),
      description: faker.lorem.words(3),
      fields: [
        {
          constraints: [{ type: "required" }],
          description: faker.lorem.words(3),
          key: faker.lorem.word(),
          label: faker.lorem.word(),
          metadata: {},
          readonly: faker.helpers.arrayElement([false, true]),
          treatments: [faker.lorem.word()],
          type: faker.lorem.word(),
        },
      ],
      metadata: {},
      name: faker.lorem.word(),
      readonly: faker.helpers.arrayElement([false, true]),
      slug: faker.lorem.word(),
    },
    countRecords: {
      error: faker.number.int({ min: 0 }),
      errorsByField: {},
      total: faker.number.int({ min: 0 }),
      valid: faker.number.int({ min: 0 }),
    },
    createdAt: faker.date.past().toISOString(),
    name: faker.lorem.word(),
    namespace: faker.lorem.word(),
    updatedAt: faker.date.past().toISOString(),
    workbookId: `us_wb_${randomId()()}`,
  });
}

describe("sheets", () => {
  describe("[Decoders]", () => {
    it("Sheet", () => {
      const decoded = pipe(_mkMockSheet()(), SheetCodec.decode);

      expect(E.isRight(decoded)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    const secret: string = "secret";
    const environmentId: string = "environmentId";
    const client = mkApiClient(secret, environmentId);
    const baseUrl: string = "https://platform.flatfile.com/api/v1";

    it("should handle failure when creating a Sheet", async () => {
      // setup
      const restHandlers = [
        rest.post(`${baseUrl}/sheets`, (_req, res, ctx) => {
          return res(
            ctx.status(400),
            ctx.json({
              errors: [
                {
                  key: faker.lorem.word(),
                  message: faker.lorem.sentence(),
                },
              ],
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.sheets.create({} as CreateSheetInput);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when creating a Sheet", async () => {
      // setup
      const mockSheet: Sheet = _mkMockSheet()();

      const restHandlers = [
        rest.post(`${baseUrl}/sheets`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockSheet,
                name: undefined,
              },
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.sheets.create(mockSheet);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting string at 0.name but instead got: undefined`]),
        )
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle successfully creating a Sheet", async () => {
      // setup
      const mockSheet: Sheet = _mkMockSheet()();

      const restHandlers = [
        rest.post(`${baseUrl}/sheets`, (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: mockSheet }));
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.sheets.create(mockSheet);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockSheet))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });
  });
});
