import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import { baseUrl, client, mkSheetId, mkVersionId } from "./helpers.mjs";
import { SheetId, VersionId } from "../src/lib/ids.mjs";
import { Version } from "../src/lib/versions.mjs";

function _mkMockVersion(): IO.IO<Version> {
  return IO.of({
    versionId: mkVersionId()(),
  });
}

describe("versions", () => {
  it("[Mocks] should handle failure when creating a Version", async () => {
    // setup
    const sheetId: SheetId = mkSheetId()();
    const parentVersionId: VersionId = mkVersionId()();

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

  it("[Mocks] should handle decoder errors when creating a Version", async () => {
    // setup
    const sheetId: SheetId = mkSheetId()();
    const parentVersionId: VersionId = mkVersionId()();

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

  it("[Mocks] should handle successfully creating a Version", async () => {
    // setup
    const sheetId: SheetId = mkSheetId()();
    const parentVersionId: VersionId = mkVersionId()();
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
