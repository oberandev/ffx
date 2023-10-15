import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import {
  baseUrl,
  client,
  maybePresent,
  mkSheetId,
  mkWorkbookId,
  multipleOf,
  oneOf,
} from "./helpers.mjs";
import { WorkbookId } from "../src/lib/ids.mjs";
import { Sheet, Sheets } from "../src/lib/sheets.mjs";

function _mkMockSheet(): IO.IO<Sheet> {
  return IO.of({
    id: mkSheetId()(),
    config: {
      access: maybePresent(() => multipleOf(["*", "add", "delete", "edit", "import"])),
      actions: maybePresent(() => [
        {
          confirm: maybePresent(() => oneOf([false, true])),
          description: maybePresent(() => faker.lorem.words(3)),
          icon: maybePresent(() => faker.lorem.word()),
          inputForm: maybePresent(() => ({
            fields: [
              {
                config: maybePresent(() => ({
                  options: {
                    color: maybePresent(() => faker.lorem.word()),
                    description: maybePresent(() => faker.lorem.words(3)),
                    icon: maybePresent(() => faker.lorem.word()),
                    label: maybePresent(() => faker.lorem.word()),
                    meta: maybePresent(() => ({})),
                    value: oneOf([oneOf([false, true]), faker.number.int(), faker.lorem.word()]),
                  },
                })),
                constraints: maybePresent(() => [{ type: "required" }]),
                description: maybePresent(() => faker.lorem.words(3)),
                key: faker.lorem.word(),
                label: faker.lorem.word(),
                type: oneOf(["boolean", "enum", "number", "string", "textarea"]),
              },
            ],
            type: "simple",
          })),
          label: faker.lorem.word(),
          mode: maybePresent(() => oneOf(["background", "foreground"])),
          operation: maybePresent(() => faker.lorem.word()),
          primary: maybePresent(() => oneOf([false, true])),
          requireAllValid: maybePresent(() => oneOf([false, true])),
          requireSelection: maybePresent(() => oneOf([false, true])),
          schedule: maybePresent(() => oneOf(["daily", "hourly", "weekly"])),
          tooltip: maybePresent(() => faker.lorem.word()),
        },
      ]),
      allowAdditionalFields: maybePresent(() => oneOf([false, true])),
      description: maybePresent(() => faker.lorem.words(3)),
      fields: [
        {
          constraints: maybePresent(() => [{ type: "required" }]),
          description: maybePresent(() => faker.lorem.words(3)),
          key: faker.lorem.word(),
          label: maybePresent(() => faker.lorem.word()),
          metadata: maybePresent(() => ({})),
          readonly: maybePresent(() => oneOf([false, true])),
          treatments: maybePresent(() => [faker.lorem.word()]),
          type: faker.lorem.word(),
        },
      ],
      metadata: maybePresent(() => ({})),
      name: faker.lorem.word(),
      readonly: oneOf([false, true]),
      slug: maybePresent(() => faker.lorem.word()),
    },
    countRecords: maybePresent(() => ({
      error: faker.number.int({ min: 0 }),
      errorsByField: {},
      total: faker.number.int({ min: 0 }),
      valid: faker.number.int({ min: 0 }),
    })),
    createdAt: faker.date.past(),
    name: faker.lorem.word(),
    namespace: maybePresent(() => faker.lorem.word()),
    updatedAt: faker.date.past(),
    workbookId: mkWorkbookId()(),
  });
}

describe("sheets", () => {
  it("[Mocks] should handle failure when deleting a Sheet", async () => {
    // setup
    const mockSheet: Sheet = _mkMockSheet()();

    const restHandlers = [
      rest.delete(`${baseUrl}/sheets/${mockSheet.id}`, (_, res, ctx) => {
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
    const resp = await client.sheets.delete(mockSheet.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when deleting a Sheet", async () => {
    // setup
    const mockSheet: Sheet = _mkMockSheet()();

    const restHandlers = [
      rest.delete(`${baseUrl}/sheets/${mockSheet.id}`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: {
              success: "foobar",
            },
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.sheets.delete(mockSheet.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully deleting a Sheet", async () => {
    // setup
    const mockSheet: Sheet = _mkMockSheet()();

    const restHandlers = [
      rest.delete(`${baseUrl}/sheets/${mockSheet.id}`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: {
              success: true,
            },
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.sheets.delete(mockSheet.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when fetching a Sheet", async () => {
    // setup
    const mockSheet: Sheet = _mkMockSheet()();

    const restHandlers = [
      rest.get(`${baseUrl}/sheets/${mockSheet.id}`, (_, res, ctx) => {
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
    const resp = await client.sheets.get(mockSheet.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when fetching a Sheet", async () => {
    // setup
    const mockSheet: Sheet = _mkMockSheet()();

    const restHandlers = [
      rest.get(`${baseUrl}/sheets/${mockSheet.id}`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: {
              ...mockSheet,
              id: null,
            },
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.sheets.get(mockSheet.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting SheetIdFromString at 0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully fetching a Sheet", async () => {
    // setup
    const mockSheet: Sheet = _mkMockSheet()();

    const restHandlers = [
      rest.get(`${baseUrl}/sheets/${mockSheet.id}`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: mockSheet,
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.sheets.get(mockSheet.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockSheet))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when fetching all Sheets", async () => {
    // setup
    const restHandlers = [
      rest.get(`${baseUrl}/sheets`, (_, res, ctx) => {
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
    const workbookId: WorkbookId = mkWorkbookId()();
    const resp = await client.sheets.list(workbookId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when fetching all Sheets", async () => {
    // setup
    const mockSheet: Sheet = _mkMockSheet()();

    const restHandlers = [
      rest.get(`${baseUrl}/sheets`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: [{ ...mockSheet, id: null }],
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const workbookId: WorkbookId = mkWorkbookId()();
    const resp = await client.sheets.list(workbookId);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          "Expecting SheetIdFromString at 0.0.id but instead got: null",
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully fetching all Sheets", async () => {
    // setup
    const mockSheets: Sheets = Array.from({ length: 2 }, () => _mkMockSheet()());

    const restHandlers = [
      rest.get(`${baseUrl}/sheets`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: mockSheets,
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const workbookId: WorkbookId = mkWorkbookId()();
    const resp = await client.sheets.list(workbookId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockSheets))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });
});
