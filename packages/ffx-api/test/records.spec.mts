import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import {
  baseUrl,
  client,
  maybePresent,
  mkRecordId,
  mkSheetId,
  mkVersionId,
  oneOf,
} from "./helpers.mjs";
import { SheetId } from "../src/lib/ids.mjs";
import { Records } from "../src/lib/records.mjs";

function _mkMockRecords(): IO.IO<Records> {
  return IO.of({
    counts: maybePresent(() => ({
      error: faker.number.int(),
      errorsByField: maybePresent(() => ({
        property1: faker.number.int(),
        property2: faker.number.int(),
      })),
      total: faker.number.int(),
      valid: faker.number.int(),
    })),
    records: [
      {
        id: mkRecordId()(),
        messages: maybePresent(() => [
          {
            message: maybePresent(() => faker.lorem.word()),
            source: maybePresent(() =>
              oneOf([
                "custom-logic",
                "invalid-option",
                "is-artifact",
                "required-constraint",
                "unique-constraint",
                "unlinked",
              ]),
            ),
            type: maybePresent(() => oneOf(["error", "info", "warn"])),
          },
        ]),
        metadata: maybePresent(() => ({})),
        valid: maybePresent(() => oneOf([false, true])),
        values: {
          property1: {
            layer: faker.lorem.word(),
            links: [],
            messages: [],
            updatedAt: faker.date.past(),
            valid: oneOf([false, true]),
            value: oneOf([faker.date.past(), false, true, faker.number.int(), faker.lorem.word()]),
          },
        },
        versionId: maybePresent(() => mkVersionId()()),
      },
    ],
    success: oneOf([false, true]),
    versionId: maybePresent(() => mkVersionId()()),
  });
}

describe("records", () => {
  it("[Mock] should handle failure when deleting Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.delete(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            errors: [
              {
                key: faker.lorem.word(),
                message: faker.lorem.sentence(),
              },
            ],
          },
          { status: 400 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.delete(sheetId, [mockRecords.records[0].id]);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when deleting Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.delete(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            data: {
              success: "foobar",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.delete(sheetId, [mockRecords.records[0].id]);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully deleting Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.delete(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            data: {
              success: true,
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.delete(sheetId, [mockRecords.records[0].id]);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when inserting Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.post(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            errors: [
              {
                key: faker.lorem.word(),
                message: faker.lorem.sentence(),
              },
            ],
          },
          { status: 400 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.insert(sheetId, mockRecords.records);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when inserting Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.post(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockRecords,
              success: "foobar",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.insert(sheetId, mockRecords.records);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at 0.success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully inserting Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.post(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            data: mockRecords,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.insert(sheetId, mockRecords.records);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockRecords))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching all Records", async () => {
    // setup
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.get(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            errors: [
              {
                key: faker.lorem.word(),
                message: faker.lorem.sentence(),
              },
            ],
          },
          { status: 400 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.get(sheetId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching all Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.get(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockRecords,
              success: "foobar",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.get(sheetId);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at 0.success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching all Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.get(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            data: mockRecords,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.get(sheetId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockRecords))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when updating Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.put(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            errors: [
              {
                key: faker.lorem.word(),
                message: faker.lorem.sentence(),
              },
            ],
          },
          { status: 400 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.update(sheetId, [mockRecords.records[0]]);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when updating Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.put(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockRecords,
              success: "foobar",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.update(sheetId, [mockRecords.records[0]]);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at 0.success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully updating Records", async () => {
    // setup
    const mockRecords: Records = _mkMockRecords()();
    const sheetId: SheetId = mkSheetId()();

    const restHandlers = [
      http.put(`${baseUrl}/sheets/${sheetId}/records`, () => {
        return HttpResponse.json(
          {
            data: mockRecords,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.records.update(sheetId, [mockRecords.records[0]]);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockRecords))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });
});
