import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import mkApiClient from "../src/index.mjs";
import {
  EnvironmentId,
  SpaceIdFromString,
  isoEnvironmentId,
  isoSpaceId,
  isoUserId,
  isoWorkbookId,
} from "../src/lib/ids.mjs";
import { Space, SpaceC } from "../src/lib/spaces.mjs";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

function _mkMockSpace(): IO.IO<Space> {
  return IO.of({
    id: isoSpaceId.wrap(`us_sp_${randomId()()}`),
    access: faker.helpers.arrayElements(["*", "add", "delete", "edit", "import"]),
    accessToken: faker.lorem.word(),
    actions: [],
    archivedAt: faker.date.past().toISOString(),
    autoConfigure: faker.helpers.arrayElement([false, true]),
    createdAt: faker.date.past().toISOString(),
    createdByUserId: isoUserId.wrap(`us_usr_${randomId()()}`),
    displayOrder: faker.number.int(),
    environmentId: isoEnvironmentId.wrap(`us_env_${randomId()()}`),
    filesCount: faker.number.int(),
    guestAuthentication: [faker.helpers.arrayElement(["magic_link", "shared_link"])],
    guestLink: [faker.internet.url()],
    isCollaborative: faker.helpers.arrayElement([false, true]),
    labels: [faker.lorem.word()],
    metadata: {},
    name: faker.lorem.word(),
    namespace: faker.lorem.word(),
    primaryWorkbookId: isoWorkbookId.wrap(`us_wb_${randomId()()}`),
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
      const encoded = isoSpaceId.wrap(`us_sp_${randomId()()}`);

      expect(SpaceIdFromString.is(encoded)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    const secret: string = "secret";
    const environmentId: EnvironmentId = isoEnvironmentId.wrap("environmentId");
    const client = mkApiClient(secret, environmentId);
    const baseUrl: string = "https://platform.flatfile.com/api/v1";

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
        accessToken: mockSpace.accessToken,
        archivedAt: mockSpace.archivedAt,
        autoConfigure: mockSpace.autoConfigure,
        createdAt: mockSpace.createdAt,
        createdByUserId: mockSpace.createdByUserId,
        displayOrder: mockSpace.displayOrder,
        environmentId: mockSpace.environmentId,
        filesCount: mockSpace.filesCount,
        guestAuthentication: mockSpace.guestAuthentication,
        guestLink: mockSpace.guestLink,
        isCollaborative: mockSpace.isCollaborative,
        labels: mockSpace.labels,
        metadata: mockSpace.metadata,
        name: mockSpace.name,
        namespace: mockSpace.namespace,
        primaryWorkbookId: mockSpace.primaryWorkbookId,
        size: mockSpace.size,
        translationsPath: mockSpace.translationsPath,
        updatedAt: mockSpace.updatedAt,
        upgradedAt: mockSpace.upgradedAt,
        workbooksCount: mockSpace.workbooksCount,
      });

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });
  });
});
