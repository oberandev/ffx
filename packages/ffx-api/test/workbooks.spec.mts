import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import mkApiClient from "../src/index.mjs";
import { isoSpaceId } from "../src/lib/documents.mjs";
import { EnvironmentId, isoEnvironmentId } from "../src/lib/environments.mjs";
import {
  Workbook,
  WorkbookC,
  WorkbookIdFromString,
  Workbooks,
  isoWorkbookId,
} from "../src/lib/workbooks.mjs";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

function _mkMockWorkbook(): IO.IO<Workbook> {
  return IO.of({
    id: isoWorkbookId.wrap(`us_wb_${randomId()()}`),
    actions: [],
    createdAt: faker.date.past().toISOString(),
    environmentId: isoEnvironmentId.wrap(`us_env_${randomId()()}`),
    labels: [faker.lorem.word()],
    metadata: {},
    name: faker.lorem.word(),
    namespace: faker.lorem.word(),
    sheets: [],
    spaceId: isoSpaceId.wrap(`us_sp_${randomId()()}`),
    updatedAt: faker.date.past().toISOString(),
  });
}

describe("sheets", () => {
  describe("[Codecs]", () => {
    it("Sheet", () => {
      const decoded = pipe(_mkMockWorkbook()(), WorkbookC.decode);

      expect(E.isRight(decoded)).toBe(true);
    });

    it("WorkbookId", () => {
      const encoded = isoWorkbookId.wrap(`us_wb_${randomId()()}`);

      expect(WorkbookIdFromString.is(encoded)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    const secret: string = "secret";
    const environmentId: EnvironmentId = isoEnvironmentId.wrap("environmentId");
    const client = mkApiClient(secret, environmentId);
    const baseUrl: string = "https://platform.flatfile.com/api/v1";

    it("should handle failure when creating a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.post(`${baseUrl}/workbooks`, (_req, res, ctx) => {
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
        namespace: mockWorkbook.namespace,
        sheets: mockWorkbook.sheets,
        spaceId: mockWorkbook.spaceId,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when creating a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.post(`${baseUrl}/workbooks`, (_req, res, ctx) => {
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
        namespace: mockWorkbook.namespace,
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

    it("should handle successfully creating a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.post(`${baseUrl}/workbooks`, (_req, res, ctx) => {
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
        namespace: mockWorkbook.namespace,
        sheets: mockWorkbook.sheets,
        spaceId: mockWorkbook.spaceId,
      });

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockWorkbook))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle failure when deleting a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.delete(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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

    it("should handle decoder errors when deleting a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.delete(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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

    it("should handle successfully deleting a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.delete(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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

    it("should handle failure when fetching a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.get(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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

    it("should handle decoder errors when fetching a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.get(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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
          expect(reasons).toStrictEqual([`Expecting WorkbookId at 0.id but instead got: null`]),
        )
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.get(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockWorkbook))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching all Workbooks", async () => {
      // setup
      const restHandlers = [
        rest.get(`${baseUrl}/workbooks`, (_req, res, ctx) => {
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

    it("should handle decoder errors when fetching all Workbooks", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.get(`${baseUrl}/workbooks`, (_req, res, ctx) => {
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
          expect(reasons).toStrictEqual(["Expecting WorkbookId at 0.0.id but instead got: null"]),
        )
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching all Workbooks", async () => {
      // setup
      const mockWorkbooks: Workbooks = Array.from({ length: 2 }, () => _mkMockWorkbook()());

      const restHandlers = [
        rest.get(`${baseUrl}/workbooks`, (_req, res, ctx) => {
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
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockWorkbooks))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle failure when updating a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.patch(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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
        namespace: mockWorkbook.namespace,
        sheets: mockWorkbook.sheets,
        spaceId: mockWorkbook.spaceId,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when updating a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.patch(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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
        namespace: mockWorkbook.namespace,
        sheets: mockWorkbook.sheets,
        spaceId: mockWorkbook.spaceId,
      });

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting WorkbookId at 0.id but instead got: null`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully updating a Workbook", async () => {
      // setup
      const mockWorkbook: Workbook = _mkMockWorkbook()();

      const restHandlers = [
        rest.patch(`${baseUrl}/workbooks/${mockWorkbook.id}`, (_req, res, ctx) => {
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
        namespace: mockWorkbook.namespace,
        sheets: mockWorkbook.sheets,
        spaceId: mockWorkbook.spaceId,
      });

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockWorkbook))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });
  });
});
