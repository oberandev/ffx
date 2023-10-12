import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import { baseUrl, client, mkEnvironmentId, mkSpaceId, mkUserId, mkWorkbookId } from "./helpers.mjs";
import { SpaceIdFromString } from "../src/lib/ids.mjs";
import { Space, SpaceC } from "../src/lib/spaces.mjs";

function _mkMockSpace(): IO.IO<Space> {
  return IO.of({
    id: mkSpaceId()(),
    access: faker.helpers.arrayElements(["*", "add", "delete", "edit", "import"]),
    accessToken: faker.lorem.word(),
    actions: [],
    archivedAt: faker.date.past().toISOString(),
    autoConfigure: faker.helpers.arrayElement([false, true]),
    createdAt: faker.date.past().toISOString(),
    createdByUserId: mkUserId()(),
    displayOrder: faker.number.int(),
    environmentId: mkEnvironmentId()(),
    filesCount: faker.number.int(),
    guestAuthentication: [faker.helpers.arrayElement(["magic_link", "shared_link"])],
    guestLink: [faker.internet.url()],
    isCollaborative: faker.helpers.arrayElement([false, true]),
    labels: [faker.lorem.word()],
    metadata: {},
    name: faker.lorem.word(),
    namespace: faker.lorem.word(),
    primaryWorkbookId: mkWorkbookId()(),
    updatedAt: faker.date.past().toISOString(),
    size: {
      id: faker.lorem.word(),
      name: faker.lorem.word(),
      numFiles: faker.number.int(),
      numUsers: faker.number.int(),
      pdv: faker.number.int(),
    },
    translationsPath: faker.lorem.word(),
    upgradedAt: faker.date.past().toISOString(),
    workbooksCount: faker.number.int(),
  });
}

describe("spaces", () => {
  describe("[Codecs]", () => {
    it("Space", () => {
      const decoded = pipe(_mkMockSpace()(), SpaceC.decode);

      expect(E.isRight(decoded)).toBe(true);
    });

    it("SpaceId", () => {
      const brandedT = mkSpaceId()();

      expect(SpaceIdFromString.is(brandedT)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    it("should handle failure when archiving a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.post(`${baseUrl}/spaces/${mockSpace.id}/archive`, (_req, res, ctx) => {
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
      const resp = await client.spaces.archive(mockSpace.id);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when archiving a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.post(`${baseUrl}/spaces/${mockSpace.id}/archive`, (_req, res, ctx) => {
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
      const resp = await client.spaces.archive(mockSpace.id);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully archiving a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.post(`${baseUrl}/spaces/${mockSpace.id}/archive`, (_req, res, ctx) => {
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
      const resp = await client.spaces.archive(mockSpace.id);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when creating a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.post(`${baseUrl}/spaces`, (_req, res, ctx) => {
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

    it("should handle decoder errors when creating a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.post(`${baseUrl}/spaces`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockSpace,
                id: "bogus_space_id",
              },
            }),
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

    it("should handle successfully creating a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.post(`${baseUrl}/spaces`, (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: mockSpace }));
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
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockSpace))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when deleting a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.delete(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
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
      const resp = await client.spaces.delete(mockSpace.id);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when deleting a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.delete(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
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
      const resp = await client.spaces.delete(mockSpace.id);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully deleting a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.delete(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
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
      const resp = await client.spaces.delete(mockSpace.id);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.get(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
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
      const resp = await client.spaces.get(mockSpace.id);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when fetching a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.get(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockSpace,
                id: null,
              },
            }),
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

    it("should handle successfully fetching a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.get(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockSpace,
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.spaces.get(mockSpace.id);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockSpace))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching all Space", async () => {
      // setup
      const restHandlers = [
        rest.get(`${baseUrl}/spaces`, (_req, res, ctx) => {
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
      const resp = await client.spaces.list();

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when fetching all Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.get(`${baseUrl}/spaces`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: [
                {
                  ...mockSpace,
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

    it("should handle successfully fetching all Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.get(`${baseUrl}/spaces`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: [mockSpace],
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.spaces.list();

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual([mockSpace]))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle failure when updating a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.patch(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
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

    it("should handle decoder errors when updating a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.patch(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockSpace,
                id: null,
              },
            }),
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

    it("should handle successfully updating a Space", async () => {
      // setup
      const mockSpace: Space = _mkMockSpace()();

      const restHandlers = [
        rest.patch(`${baseUrl}/spaces/${mockSpace.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockSpace,
            }),
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
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockSpace))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });
  });
});
