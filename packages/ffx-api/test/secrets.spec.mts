import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import {
  baseUrl,
  client,
  maybePresent,
  mkEnvironmentId,
  mkSecretId,
  mkSpaceId,
} from "./helpers.mjs";
import { EnvironmentId, SpaceId } from "../src/lib/ids.mjs";
import { Secret } from "../src/lib/secrets.mjs";

function _mkMockSecret(): IO.IO<Secret> {
  return IO.of({
    id: mkSecretId()(),
    environmentId: mkEnvironmentId()(),
    name: faker.lorem.word(),
    spaceId: maybePresent(() => mkSpaceId()()),
    value: faker.lorem.word(),
  });
}

describe("secrets", () => {
  it("[Mocks] should handle failure when deleting a Secret", async () => {
    // setup
    const mockSecret: Secret = _mkMockSecret()();

    const restHandlers = [
      http.delete(`${baseUrl}/secrets/${mockSecret.id}`, () => {
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
    const resp = await client.secrets.delete(mockSecret.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when deleting a Secret", async () => {
    // setup
    const mockSecret: Secret = _mkMockSecret()();

    const restHandlers = [
      http.delete(`${baseUrl}/secrets/${mockSecret.id}`, () => {
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
    const resp = await client.secrets.delete(mockSecret.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully deleting a Secret", async () => {
    // setup
    const mockSecret: Secret = _mkMockSecret()();

    const restHandlers = [
      http.delete(`${baseUrl}/secrets/${mockSecret.id}`, () => {
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
    const resp = await client.secrets.delete(mockSecret.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when fetching all Secrets", async () => {
    // setup
    const restHandlers = [
      http.get(`${baseUrl}/secrets`, () => {
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
    const environmentId: EnvironmentId = mkEnvironmentId()();
    const spaceId: SpaceId = mkSpaceId()();
    const resp = await client.secrets.list(environmentId, spaceId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when fetching all Secrets", async () => {
    // setup
    const mockSecret: Secret = _mkMockSecret()();

    const restHandlers = [
      http.get(`${baseUrl}/secrets`, () => {
        return HttpResponse.json(
          {
            data: [
              {
                ...mockSecret,
                id: null,
              },
            ],
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const environmentId: EnvironmentId = mkEnvironmentId()();
    const spaceId: SpaceId = mkSpaceId()();
    const resp = await client.secrets.list(environmentId, spaceId);

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

  it("[Mocks] should handle successfully fetching all Secrets", async () => {
    // setup
    const mockSecret: Secret = _mkMockSecret()();

    const restHandlers = [
      http.get(`${baseUrl}/secrets`, () => {
        return HttpResponse.json(
          {
            data: [mockSecret],
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const environmentId: EnvironmentId = mkEnvironmentId()();
    const spaceId: SpaceId = mkSpaceId()();
    const resp = await client.secrets.list(environmentId, spaceId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual([mockSecret]))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when upserting a Secret", async () => {
    // setup
    const mockSecret: Secret = _mkMockSecret()();

    const restHandlers = [
      http.post(`${baseUrl}/secrets`, () => {
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
    const resp = await client.secrets.upsert({
      environmentId: mkEnvironmentId()(),
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

  it("[Mocks] should handle decoder errors when upserting a Secret", async () => {
    // setup
    const mockSecret: Secret = _mkMockSecret()();

    const restHandlers = [
      http.post(`${baseUrl}/secrets`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockSecret,
              id: "bogus_secret_id",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.secrets.upsert({
      environmentId: mkEnvironmentId()(),
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

  it("[Mocks] should handle successfully upserting a Secret", async () => {
    // setup
    const mockSecret: Secret = _mkMockSecret()();

    const restHandlers = [
      http.post(`${baseUrl}/secrets`, () => {
        return HttpResponse.json(
          {
            data: mockSecret,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.secrets.upsert({
      environmentId: mkEnvironmentId()(),
      name: mockSecret.name,
      spaceId: mockSecret.spaceId,
      value: mockSecret.value,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockSecret))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });
});
