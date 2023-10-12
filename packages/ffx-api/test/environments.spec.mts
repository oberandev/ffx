import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import { baseUrl, client, mkAccountId, mkEnvironmentId } from "./helpers.mjs";
import { Environment, EnvironmentC } from "../src/lib/environments.mjs";
import { AccountIdFromString, EnvironmentIdFromString } from "../src/lib/ids.mjs";

function _mkMockEnvironment(): IO.IO<Environment> {
  return IO.of({
    id: mkEnvironmentId()(),
    accountId: mkAccountId()(),
    features: {},
    guestAuthentication: [faker.helpers.arrayElement(["magic_link", "shared_link"])],
    isProd: faker.helpers.arrayElement([false, true]),
    metadata: {},
    name: faker.lorem.word(),
  });
}

describe("environments", () => {
  describe("[Codecs]", () => {
    it("Environment", () => {
      const decoded = pipe(_mkMockEnvironment()(), EnvironmentC.decode);

      expect(E.isRight(decoded)).toBe(true);
    });

    it("EnvironmentId", () => {
      const encoded = mkEnvironmentId()();

      expect(EnvironmentIdFromString.is(encoded)).toBe(true);
    });

    it("AccountId", () => {
      const brandedT = mkAccountId()();

      expect(AccountIdFromString.is(brandedT)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    it("should handle failure when creating an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.post(`${baseUrl}/environments`, (_req, res, ctx) => {
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
      const resp = await client.environments.create({
        guestAuthentication: mockEnvironment.guestAuthentication,
        isProd: mockEnvironment.isProd,
        metadata: mockEnvironment.metadata,
        name: mockEnvironment.name,
        namespaces: mockEnvironment.namespaces,
        translationsPath: mockEnvironment.translationsPath,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when creating an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.post(`${baseUrl}/environments`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockEnvironment,
                id: null,
              },
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.environments.create({
        guestAuthentication: mockEnvironment.guestAuthentication,
        isProd: mockEnvironment.isProd,
        metadata: mockEnvironment.metadata,
        name: mockEnvironment.name,
        namespaces: mockEnvironment.namespaces,
        translationsPath: mockEnvironment.translationsPath,
      });

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting EnvironmentIdFromString at 0.id but instead got: null`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when creating an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.post(`${baseUrl}/environments`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockEnvironment,
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.environments.create({
        guestAuthentication: mockEnvironment.guestAuthentication,
        isProd: mockEnvironment.isProd,
        metadata: mockEnvironment.metadata,
        name: mockEnvironment.name,
        namespaces: mockEnvironment.namespaces,
        translationsPath: mockEnvironment.translationsPath,
      });

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockEnvironment))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when deleting an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.delete(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
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
      const resp = await client.environments.delete(mockEnvironment.id);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when deleting an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.delete(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
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
      const resp = await client.environments.delete(mockEnvironment.id);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully deleting an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.delete(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
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
      const resp = await client.environments.delete(mockEnvironment.id);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.get(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
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
      const resp = await client.environments.get(mockEnvironment.id);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when fetching an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.get(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockEnvironment,
                accountId: null,
              },
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.environments.get(mockEnvironment.id);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting AccountIdFromString at 0.accountId but instead got: null`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.get(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockEnvironment,
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.environments.get(mockEnvironment.id);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockEnvironment))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching all Environments", async () => {
      // setup
      const restHandlers = [
        rest.get(`${baseUrl}/environments`, (_req, res, ctx) => {
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
      const resp = await client.environments.list();

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when fetching all Environments", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.get(`${baseUrl}/environments`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: [
                {
                  ...mockEnvironment,
                  id: null,
                },
              ],
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.environments.list();

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting EnvironmentIdFromString at 0.0.id but instead got: null`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching all Environments", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.get(`${baseUrl}/environments`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: [mockEnvironment],
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.environments.list();

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual([mockEnvironment]))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when updating an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.patch(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
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
      const resp = await client.environments.update(mockEnvironment.id, {
        guestAuthentication: mockEnvironment.guestAuthentication,
        isProd: mockEnvironment.isProd,
        metadata: mockEnvironment.metadata,
        name: mockEnvironment.name,
        namespaces: mockEnvironment.namespaces,
        translationsPath: mockEnvironment.translationsPath,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when updating an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.patch(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockEnvironment,
                id: null,
              },
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.environments.update(mockEnvironment.id, {
        guestAuthentication: mockEnvironment.guestAuthentication,
        isProd: mockEnvironment.isProd,
        metadata: mockEnvironment.metadata,
        name: mockEnvironment.name,
        namespaces: mockEnvironment.namespaces,
        translationsPath: mockEnvironment.translationsPath,
      });

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting EnvironmentIdFromString at 0.id but instead got: null`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully updating an Environment", async () => {
      // setup
      const mockEnvironment: Environment = _mkMockEnvironment()();

      const restHandlers = [
        rest.patch(`${baseUrl}/environments/${mockEnvironment.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockEnvironment,
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.environments.update(mockEnvironment.id, {
        guestAuthentication: mockEnvironment.guestAuthentication,
        isProd: mockEnvironment.isProd,
        metadata: mockEnvironment.metadata,
        name: mockEnvironment.name,
        namespaces: mockEnvironment.namespaces,
        translationsPath: mockEnvironment.translationsPath,
      });

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockEnvironment))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });
  });
});
