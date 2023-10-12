import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import mkApiClient, { isoSpaceId } from "../src/index.mjs";
import {
  EnvironmentId,
  SecretId,
  SecretIdFromString,
  isoEnvironmentId,
  isoSecretId,
} from "../src/lib/ids.mjs";
import { Secret, SecretC } from "../src/lib/secrets.mjs";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

function _mkMockSecret(): IO.IO<Secret> {
  return IO.of({
    id: isoSecretId.wrap(`us_sec_${randomId()()}`),
    spaceId: isoSpaceId.wrap(`us_sp_${randomId()()}`),
    name: faker.lorem.word(),
    value: faker.lorem.word(),
    environmentId: isoEnvironmentId.wrap(`us_env_${randomId()()}`),
  });
}

describe("secrets", () => {
  describe("[Codecs]", () => {
    it("Secret", () => {
      const decoded = pipe(_mkMockSecret()(), SecretC.decode);

      expect(E.isRight(decoded)).toBe(true);
    });

    it("SecretId", () => {
      const encoded: SecretId = isoSecretId.wrap(`us_sec_${randomId()()}`);

      expect(SecretIdFromString.is(encoded)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    const secret: string = "secret";
    const environmentId: EnvironmentId = isoEnvironmentId.wrap(`us_env_${randomId()()}`);
    const client = mkApiClient(secret, environmentId);
    const baseUrl: string = "https://platform.flatfile.com/api/v1";

    it("should handle failure when creating a Secret", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.post(`${baseUrl}/secrets`, (_req, res, ctx) => {
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
      const resp = await client.secrets.create({
        environmentId: mockSecret.environmentId,
        name: mockSecret.name,
        spaceId: mockSecret.spaceId,
        value: mockSecret.value,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when creating a Secret", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.post(`${baseUrl}/secrets`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockSecret,
                id: "bogus_secret_id",
              },
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.secrets.create({
        environmentId: mockSecret.environmentId,
        name: mockSecret.name,
        spaceId: mockSecret.spaceId,
        value: mockSecret.value,
      });

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting SecretIdFromString at 0.id but instead got: "bogus_secret_id"`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully creating a Secret", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.post(`${baseUrl}/secrets`, (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: mockSecret }));
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.secrets.create({
        environmentId: mockSecret.environmentId,
        name: mockSecret.name,
        spaceId: mockSecret.spaceId,
        value: mockSecret.value,
      });

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockSecret))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when deleting a Secret", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.delete(`${baseUrl}/secrets/${mockSecret.id}`, (_req, res, ctx) => {
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
      const resp = await client.secrets.delete(mockSecret.id);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when deleting a Secret", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.delete(`${baseUrl}/secrets/${mockSecret.id}`, (_req, res, ctx) => {
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
      const resp = await client.secrets.delete(mockSecret.id);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully deleting a Secret", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.delete(`${baseUrl}/secrets/${mockSecret.id}`, (_req, res, ctx) => {
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
      const resp = await client.secrets.delete(mockSecret.id);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching all Secrets", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.get(`${baseUrl}/secrets`, (_req, res, ctx) => {
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
      const resp = await client.secrets.list(mockSecret.environmentId);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when fetching all Secrets", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.get(`${baseUrl}/secrets`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: [
                {
                  ...mockSecret,
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
      const resp = await client.secrets.list(mockSecret.environmentId);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting SecretIdFromString at 0.0.id but instead got: null`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching all Secrets", async () => {
      // setup
      const mockSecret: Secret = _mkMockSecret()();

      const restHandlers = [
        rest.get(`${baseUrl}/secrets`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: [mockSecret],
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.secrets.list(mockSecret.environmentId);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual([mockSecret]))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });
  });
});
