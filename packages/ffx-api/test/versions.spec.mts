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
  SheetId,
  VersionId,
  VersionIdFromString,
  isoEnvironmentId,
  isoSheetId,
  isoVersionId,
} from "../src/lib/ids.mjs";
import { Version, VersionC } from "../src/lib/versions.mjs";

function randomId(): IO.IO<string> {
  return IO.of(Math.random().toString(16).slice(2, 10));
}

function _mkMockVersion(): IO.IO<Version> {
  return IO.of({
    versionId: isoVersionId.wrap(`us_vr_${randomId()()}`),
  });
}

describe("versions", () => {
  describe("[Codecs]", () => {
    it("Version", () => {
      const decoded = pipe(_mkMockVersion()(), VersionC.decode);

      expect(E.isRight(decoded)).toBe(true);
    });

    it("VersionId", () => {
      const encoded = isoVersionId.wrap(`us_vr_${randomId()()}`);

      expect(VersionIdFromString.is(encoded)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    const secret: string = "secret";
    const environmentId: EnvironmentId = isoEnvironmentId.wrap("environmentId");
    const client = mkApiClient(secret, environmentId);
    const baseUrl: string = "https://platform.flatfile.com/api/v1";

    it("should handle failure when creating a Version", async () => {
      // setup
      const sheetId: SheetId = isoSheetId.wrap(`us_sh_${randomId()()}`);
      const parentVersionId: VersionId = isoVersionId.wrap(`us_vr_${randomId()()}`);

      const restHandlers = [
        rest.post(`${baseUrl}/versions`, (_req, res, ctx) => {
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
      const resp = await client.versions.create(sheetId, parentVersionId);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when creating a Version", async () => {
      // setup
      const sheetId: SheetId = isoSheetId.wrap(`us_sh_${randomId()()}`);
      const parentVersionId: VersionId = isoVersionId.wrap(`us_vr_${randomId()()}`);

      const restHandlers = [
        rest.post(`${baseUrl}/versions`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                versionId: "bogus_version_id",
              },
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.versions.create(sheetId, parentVersionId);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([
            `Expecting VersionIdFromString at versionId but instead got: "bogus_version_id"`,
          ]),
        )
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });

    it("should handle successfully creating a Version", async () => {
      // setup
      const sheetId: SheetId = isoSheetId.wrap(`us_sh_${randomId()()}`);
      const parentVersionId: VersionId = isoVersionId.wrap(`us_vr_${randomId()()}`);
      const mockVersion: Version = _mkMockVersion()();

      const restHandlers = [
        rest.post(`${baseUrl}/versions`, (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json({ data: mockVersion }));
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.versions.create(sheetId, parentVersionId);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockVersion))
        .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

      // teardown
      server.close();
    });
  });
});
