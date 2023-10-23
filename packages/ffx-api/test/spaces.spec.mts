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
  mkSpaceId,
  mkUserId,
  mkWorkbookId,
  multipleOf,
  oneOf,
} from "./helpers.mjs";
import { Space } from "../src/lib/spaces.mjs";

function _mkMockSpace(): IO.IO<Space> {
  return IO.of({
    id: mkSpaceId()(),
    access: maybePresent(() => multipleOf(["*", "add", "delete", "edit", "import"])),
    accessToken: maybePresent(() => faker.lorem.word()),
    actions: maybePresent(() => []),
    archivedAt: maybePresent(() => faker.date.past()),
    autoConfigure: maybePresent(() => oneOf([false, true])),
    createdAt: faker.date.past(),
    createdByUserId: maybePresent(() => mkUserId()()),
    displayOrder: maybePresent(() => faker.number.int()),
    environmentId: mkEnvironmentId()(),
    filesCount: maybePresent(() => faker.number.int()),
    guestAuthentication: [oneOf(["magic_link", "shared_link"])],
    guestLink: maybePresent(() => [faker.internet.url()]),
    isCollaborative: maybePresent(() => oneOf([false, true])),
    labels: maybePresent(() => [faker.lorem.word()]),
    metadata: maybePresent(() => ({})),
    name: faker.lorem.word(),
    namespace: maybePresent(() => faker.lorem.word()),
    primaryWorkbookId: maybePresent(() => mkWorkbookId()()),
    updatedAt: faker.date.past(),
    size: maybePresent(() => ({
      id: faker.lorem.word(),
      name: faker.lorem.word(),
      numFiles: faker.number.int(),
      numUsers: faker.number.int(),
      pdv: faker.number.int(),
    })),
    translationsPath: maybePresent(() => faker.lorem.word()),
    upgradedAt: maybePresent(() => faker.date.past()),
    workbooksCount: maybePresent(() => faker.number.int()),
  });
}

describe("spaces", () => {
  it("[Mocks] should handle failure when archiving a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.post(`${baseUrl}/spaces/${mockSpace.id}/archive`, () => {
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
    const resp = await client.spaces.archive(mockSpace.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when archiving a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.post(`${baseUrl}/spaces/${mockSpace.id}/archive`, () => {
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
    const resp = await client.spaces.archive(mockSpace.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully archiving a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.post(`${baseUrl}/spaces/${mockSpace.id}/archive`, () => {
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
    const resp = await client.spaces.archive(mockSpace.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when creating a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.post(`${baseUrl}/spaces`, () => {
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
    const resp = await client.spaces.create({
      access: mockSpace.access,
      actions: mockSpace.actions,
      autoConfigure: mockSpace.autoConfigure,
      displayOrder: mockSpace.displayOrder,
      environmentId: mockSpace.environmentId,
      guestAuthentication: mockSpace.guestAuthentication,
      labels: mockSpace.labels,
      metadata: mockSpace.metadata,
      name: mockSpace.name,
      namespace: mockSpace.namespace,
      primaryWorkbookId: mockSpace.primaryWorkbookId,
      translationsPath: mockSpace.translationsPath,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when creating a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.post(`${baseUrl}/spaces`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockSpace,
              id: "bogus_space_id",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.spaces.create({
      access: mockSpace.access,
      actions: mockSpace.actions,
      autoConfigure: mockSpace.autoConfigure,
      displayOrder: mockSpace.displayOrder,
      environmentId: mockSpace.environmentId,
      guestAuthentication: mockSpace.guestAuthentication,
      labels: mockSpace.labels,
      metadata: mockSpace.metadata,
      name: mockSpace.name,
      namespace: mockSpace.namespace,
      primaryWorkbookId: mockSpace.primaryWorkbookId,
      translationsPath: mockSpace.translationsPath,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting SpaceIdFromString at 0.id but instead got: "bogus_space_id"`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully creating a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.post(`${baseUrl}/spaces`, () => {
        return HttpResponse.json(
          {
            data: mockSpace,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.spaces.create({
      access: mockSpace.access,
      actions: mockSpace.actions,
      autoConfigure: mockSpace.autoConfigure,
      displayOrder: mockSpace.displayOrder,
      environmentId: mockSpace.environmentId,
      guestAuthentication: mockSpace.guestAuthentication,
      labels: mockSpace.labels,
      metadata: mockSpace.metadata,
      name: mockSpace.name,
      namespace: mockSpace.namespace,
      primaryWorkbookId: mockSpace.primaryWorkbookId,
      translationsPath: mockSpace.translationsPath,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockSpace))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when deleting a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.delete(`${baseUrl}/spaces/${mockSpace.id}`, () => {
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
    const resp = await client.spaces.delete(mockSpace.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when deleting a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.delete(`${baseUrl}/spaces/${mockSpace.id}`, () => {
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
    const resp = await client.spaces.delete(mockSpace.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully deleting a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.delete(`${baseUrl}/spaces/${mockSpace.id}`, () => {
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
    const resp = await client.spaces.delete(mockSpace.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when fetching a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.get(`${baseUrl}/spaces/${mockSpace.id}`, () => {
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
    const resp = await client.spaces.get(mockSpace.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when fetching a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.get(`${baseUrl}/spaces/${mockSpace.id}`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockSpace,
              id: null,
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.spaces.get(mockSpace.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting SpaceIdFromString at 0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully fetching a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.get(`${baseUrl}/spaces/${mockSpace.id}`, () => {
        return HttpResponse.json(
          {
            data: mockSpace,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.spaces.get(mockSpace.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockSpace))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when fetching all Space", async () => {
    // setup
    const restHandlers = [
      http.get(`${baseUrl}/spaces`, () => {
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
    const resp = await client.spaces.list();

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when fetching all Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.get(`${baseUrl}/spaces`, () => {
        return HttpResponse.json(
          {
            data: [
              {
                ...mockSpace,
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
    const resp = await client.spaces.list();

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting SpaceIdFromString at 0.0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully fetching all Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.get(`${baseUrl}/spaces`, () => {
        return HttpResponse.json(
          {
            data: [mockSpace],
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.spaces.list();

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual([mockSpace]))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle failure when updating a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.patch(`${baseUrl}/spaces/${mockSpace.id}`, () => {
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
    const resp = await client.spaces.update(mockSpace.id, {
      access: mockSpace.access,
      actions: mockSpace.actions,
      autoConfigure: mockSpace.autoConfigure,
      displayOrder: mockSpace.displayOrder,
      environmentId: mockSpace.environmentId,
      guestAuthentication: mockSpace.guestAuthentication,
      labels: mockSpace.labels,
      metadata: mockSpace.metadata,
      name: mockSpace.name,
      namespace: mockSpace.namespace,
      primaryWorkbookId: mockSpace.primaryWorkbookId,
      translationsPath: mockSpace.translationsPath,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle decoder errors when updating a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.patch(`${baseUrl}/spaces/${mockSpace.id}`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockSpace,
              id: null,
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.spaces.update(mockSpace.id, {
      access: mockSpace.access,
      actions: mockSpace.actions,
      autoConfigure: mockSpace.autoConfigure,
      displayOrder: mockSpace.displayOrder,
      environmentId: mockSpace.environmentId,
      guestAuthentication: mockSpace.guestAuthentication,
      labels: mockSpace.labels,
      metadata: mockSpace.metadata,
      name: mockSpace.name,
      namespace: mockSpace.namespace,
      primaryWorkbookId: mockSpace.primaryWorkbookId,
      translationsPath: mockSpace.translationsPath,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting SpaceIdFromString at 0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mocks] should handle successfully updating a Space", async () => {
    // setup
    const mockSpace: Space = _mkMockSpace()();

    const restHandlers = [
      http.patch(`${baseUrl}/spaces/${mockSpace.id}`, () => {
        return HttpResponse.json(
          {
            data: mockSpace,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.spaces.update(mockSpace.id, {
      access: mockSpace.access,
      actions: mockSpace.actions,
      autoConfigure: mockSpace.autoConfigure,
      displayOrder: mockSpace.displayOrder,
      environmentId: mockSpace.environmentId,
      guestAuthentication: mockSpace.guestAuthentication,
      labels: mockSpace.labels,
      metadata: mockSpace.metadata,
      name: mockSpace.name,
      namespace: mockSpace.namespace,
      primaryWorkbookId: mockSpace.primaryWorkbookId,
      translationsPath: mockSpace.translationsPath,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockSpace))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });
});
