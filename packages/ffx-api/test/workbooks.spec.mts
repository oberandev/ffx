import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import {
  baseUrl,
  client,
  maybePresent,
  mkEnvironmentId,
  mkSpaceId,
  mkWorkbookId,
} from "./helpers.mjs";
import { Workbook, Workbooks } from "../src/lib/workbooks.mjs";

function _mkMockWorkbook(): IO.IO<Workbook> {
  return IO.of({
    id: mkWorkbookId()(),
    actions: maybePresent(() => []),
    createdAt: faker.date.past(),
    environmentId: mkEnvironmentId()(),
    labels: maybePresent(() => [faker.lorem.word()]),
    metadata: maybePresent(() => ({})),
    name: faker.lorem.word(),
    namespace: maybePresent(() => faker.lorem.word()),
    sheets: maybePresent(() => []),
    spaceId: mkSpaceId()(),
    updatedAt: faker.date.past(),
  });
}

describe("workbooks", () => {
  it("[Mocks] should handle failure when creating a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.post(`${baseUrl}/workbooks`, (_, res, ctx) => {
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
    const resp = await client.workbooks.create({
      actions: mockWorkbook.actions,
      environmentId: mockWorkbook.environmentId,
      labels: mockWorkbook.labels,
      metadata: mockWorkbook.metadata,
      name: mockWorkbook.name,
      sheets: mockWorkbook.sheets,
      spaceId: mockWorkbook.spaceId,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when creating a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.post(`${baseUrl}/workbooks`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: {
              ...mockWorkbook,
              name: undefined,
            },
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.workbooks.create({
      actions: mockWorkbook.actions,
      environmentId: mockWorkbook.environmentId,
      labels: mockWorkbook.labels,
      metadata: mockWorkbook.metadata,
      name: mockWorkbook.name,
      sheets: mockWorkbook.sheets,
      spaceId: mockWorkbook.spaceId,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting string at 0.name but instead got: undefined`]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully creating a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.post(`${baseUrl}/workbooks`, (_, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: mockWorkbook }));
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.workbooks.create({
      actions: mockWorkbook.actions,
      environmentId: mockWorkbook.environmentId,
      labels: mockWorkbook.labels,
      metadata: mockWorkbook.metadata,
      name: mockWorkbook.name,
      sheets: mockWorkbook.sheets,
      spaceId: mockWorkbook.spaceId,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockWorkbook))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when deleting a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.delete(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
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
    const resp = await client.workbooks.delete(mockWorkbook.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when deleting a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.delete(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
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
    const resp = await client.workbooks.delete(mockWorkbook.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully deleting a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.delete(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
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
    const resp = await client.workbooks.delete(mockWorkbook.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when fetching a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.get(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
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
    const resp = await client.workbooks.get(mockWorkbook.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when fetching a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.get(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: {
              ...mockWorkbook,
              id: null,
            },
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.workbooks.get(mockWorkbook.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting WorkbookIdFromString at 0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully fetching a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.get(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: mockWorkbook,
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.workbooks.get(mockWorkbook.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockWorkbook))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when fetching all Workbooks", async () => {
    // setup
    const restHandlers = [
      rest.get(`${baseUrl}/workbooks`, (_, res, ctx) => {
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
    const resp = await client.workbooks.list();

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when fetching all Workbooks", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.get(`${baseUrl}/workbooks`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: [{ ...mockWorkbook, id: null }],
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.workbooks.list();

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          "Expecting WorkbookIdFromString at 0.0.id but instead got: null",
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully fetching all Workbooks", async () => {
    // setup
    const mockWorkbooks: Workbooks = Array.from({ length: 2 }, () => _mkMockWorkbook()());

    const restHandlers = [
      rest.get(`${baseUrl}/workbooks`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: mockWorkbooks,
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.workbooks.list();

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockWorkbooks))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when updating a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.patch(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
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
    const resp = await client.workbooks.update(mockWorkbook.id, {
      actions: mockWorkbook.actions,
      environmentId: mockWorkbook.environmentId,
      labels: mockWorkbook.labels,
      metadata: mockWorkbook.metadata,
      name: mockWorkbook.name,
      sheets: mockWorkbook.sheets,
      spaceId: mockWorkbook.spaceId,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when updating a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.patch(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: {
              ...mockWorkbook,
              id: null,
            },
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.workbooks.update(mockWorkbook.id, {
      actions: mockWorkbook.actions,
      environmentId: mockWorkbook.environmentId,
      labels: mockWorkbook.labels,
      metadata: mockWorkbook.metadata,
      name: mockWorkbook.name,
      sheets: mockWorkbook.sheets,
      spaceId: mockWorkbook.spaceId,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting WorkbookIdFromString at 0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully updating a Workbook", async () => {
    // setup
    const mockWorkbook: Workbook = _mkMockWorkbook()();

    const restHandlers = [
      rest.patch(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: mockWorkbook,
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.workbooks.update(mockWorkbook.id, {
      actions: mockWorkbook.actions,
      environmentId: mockWorkbook.environmentId,
      labels: mockWorkbook.labels,
      metadata: mockWorkbook.metadata,
      name: mockWorkbook.name,
      sheets: mockWorkbook.sheets,
      spaceId: mockWorkbook.spaceId,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockWorkbook))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });
});
