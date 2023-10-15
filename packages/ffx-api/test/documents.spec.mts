import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import {
  baseUrl,
  client,
  maybePresent,
  mkDocumentId,
  mkEnvironmentId,
  mkSpaceId,
} from "./helpers.mjs";
import { Document } from "../src/lib/documents.mjs";

function _mkMockDocument(): IO.IO<Document> {
  return IO.of({
    id: mkDocumentId()(),
    actions: [],
    body: faker.lorem.paragraphs(2),
    environmentId: mkEnvironmentId()(),
    spaceId: mkSpaceId()(),
    title: faker.lorem.words(2),
    treatments: maybePresent(() => [faker.lorem.word()]),
  });
}

describe("documents", () => {
  it("[Mock] should handle failure when creating a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.post(`${baseUrl}/spaces/${mockDocument.spaceId}/documents`, (_req, res, ctx) => {
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
    const resp = await client.documents.create(mockDocument.spaceId, {
      actions: mockDocument.actions,
      body: mockDocument.body,
      title: mockDocument.title,
      treatments: mockDocument.treatments,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when creating a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.post(`${baseUrl}/spaces/${mockDocument.spaceId}/documents`, (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: {
              ...mockDocument,
              id: "bogus_document_id",
            },
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.create(mockDocument.spaceId, {
      actions: mockDocument.actions,
      body: mockDocument.body,
      title: mockDocument.title,
      treatments: mockDocument.treatments,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting DocumentIdFromString at 0.id but instead got: "bogus_document_id"`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully creating a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.post(`${baseUrl}/spaces/${mockDocument.spaceId}/documents`, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: mockDocument }));
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.create(mockDocument.spaceId, {
      actions: mockDocument.actions,
      body: mockDocument.body,
      title: mockDocument.title,
      treatments: mockDocument.treatments,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockDocument))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when deleting a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.delete(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
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
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.delete(mockDocument.id, mockDocument.spaceId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when deleting a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.delete(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                success: "foobar",
              },
            }),
          );
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.delete(mockDocument.id, mockDocument.spaceId);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully deleting a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.delete(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                success: true,
              },
            }),
          );
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.delete(mockDocument.id, mockDocument.spaceId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.get(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
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
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.get(mockDocument.id, mockDocument.spaceId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.get(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockDocument,
                spaceId: null,
              },
            }),
          );
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.get(mockDocument.id, mockDocument.spaceId);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting SpaceIdFromString at 0.spaceId but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.get(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockDocument,
            }),
          );
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.get(mockDocument.id, mockDocument.spaceId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockDocument))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching all Documents", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.get(`${baseUrl}/spaces/${mockDocument.spaceId}/documents`, (_req, res, ctx) => {
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
    const resp = await client.documents.list(mockDocument.spaceId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching all Documents", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.get(`${baseUrl}/spaces/${mockDocument.spaceId}/documents`, (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: [
              {
                ...mockDocument,
                spaceId: null,
              },
            ],
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.list(mockDocument.spaceId);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting SpaceIdFromString at 0.0.spaceId but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching all Documents", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.get(`${baseUrl}/spaces/${mockDocument.spaceId}/documents`, (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: [mockDocument],
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.list(mockDocument.spaceId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual([mockDocument]))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when updating a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.patch(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
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
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.update(mockDocument.id, mockDocument.spaceId, {
      actions: mockDocument.actions,
      body: mockDocument.body,
      title: mockDocument.title,
      treatments: mockDocument.treatments,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when updating a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.patch(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockDocument,
                spaceId: null,
              },
            }),
          );
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.update(mockDocument.id, mockDocument.spaceId, {
      actions: mockDocument.actions,
      body: mockDocument.body,
      title: mockDocument.title,
      treatments: mockDocument.treatments,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting SpaceIdFromString at 0.spaceId but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully updating a Document", async () => {
    // setup
    const mockDocument: Document = _mkMockDocument()();

    const restHandlers = [
      rest.patch(
        `${baseUrl}/spaces/${mockDocument.spaceId}/documents/${mockDocument.id}`,
        (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockDocument,
            }),
          );
        },
      ),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.documents.update(mockDocument.id, mockDocument.spaceId, {
      actions: mockDocument.actions,
      body: mockDocument.body,
      title: mockDocument.title,
      treatments: mockDocument.treatments,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockDocument))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });
});
