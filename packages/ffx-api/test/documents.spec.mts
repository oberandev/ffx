import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import mkApiClient from "../src/index.mjs";
import { Document, DocumentCodec } from "../src/lib/documents.mjs";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

function _mkMockDocument(): IO.IO<Document> {
  return IO.of({
    id: `us_dc_${randomId()()}`,
    body: faker.lorem.paragraphs(2),
    title: faker.lorem.words(2),
    environmentId: `us_env_${randomId()()}`,
    spaceId: `us_sp_${randomId()()}`,
  });
}

describe("documents", () => {
  describe("[Decoders]", () => {
    it("Document", () => {
      const decoded = pipe(_mkMockDocument()(), DocumentCodec.decode);

      expect(E.isRight(decoded)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    const secret: string = "secret";
    const environmentId: string = "environmentId";
    const client = mkApiClient(secret, environmentId);
    const baseUrl: string = "https://platform.flatfile.com/api/v1";

    it("should handle failure when creating a Document", async () => {
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
      const resp = await client.documents.create({
        body: mockDocument.body,
        spaceId: mockDocument.spaceId,
        title: mockDocument.title,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when creating a Document", async () => {
      // setup
      const mockDocument: Document = _mkMockDocument()();

      const restHandlers = [
        rest.post(`${baseUrl}/spaces/${mockDocument.spaceId}/documents`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockDocument,
                spaceId: null,
              },
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.documents.create({
        body: mockDocument.body,
        spaceId: mockDocument.spaceId,
        title: mockDocument.title,
      });

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting string at spaceId but instead got: null`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully creating a Document", async () => {
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
      const resp = await client.documents.create({
        body: mockDocument.body,
        spaceId: mockDocument.spaceId,
        title: mockDocument.title,
      });

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockDocument))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when deleting a Document", async () => {
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
      const resp = await client.documents.delete({
        id: mockDocument.id,
        spaceId: mockDocument.spaceId,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when deleting a Document", async () => {
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
      const resp = await client.documents.delete({
        id: mockDocument.id,
        spaceId: mockDocument.spaceId,
      });

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully deleting a Document", async () => {
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
      const resp = await client.documents.delete({
        id: mockDocument.id,
        spaceId: mockDocument.spaceId,
      });

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching a Document", async () => {
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
      const resp = await client.documents.get({
        id: mockDocument.id,
        spaceId: mockDocument.spaceId,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when fetching a Document", async () => {
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
      const resp = await client.documents.get({
        id: mockDocument.id,
        spaceId: mockDocument.spaceId,
      });

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting string at spaceId but instead got: null`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching a Document", async () => {
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
      const resp = await client.documents.get({
        id: mockDocument.id,
        spaceId: mockDocument.spaceId,
      });

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockDocument))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching all Documents", async () => {
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

    it("should handle decoder errors when fetching all Documents", async () => {
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
          expect(reasons).toStrictEqual([`Expecting string at 0.spaceId but instead got: null`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching all Documents", async () => {
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
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual([mockDocument]))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when updating a Document", async () => {
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
      const resp = await client.documents.update(mockDocument);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when updating a Document", async () => {
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
      const resp = await client.documents.update(mockDocument);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting string at spaceId but instead got: null`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully updating a Document", async () => {
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
      const resp = await client.documents.update(mockDocument);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockDocument))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });
  });
});
