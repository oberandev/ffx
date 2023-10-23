import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import * as fs from "node:fs";
import { match } from "ts-pattern";

import {
  baseUrl,
  client,
  maybePresent,
  mkEnvironmentId,
  mkFileId,
  mkSheetId,
  mkSpaceId,
  mkWorkbookId,
  oneOf,
} from "./helpers.mjs";
import { File_ } from "../src/lib/files.mjs";

function _mkMockFile(): IO.IO<File_> {
  return IO.of({
    id: mkFileId()(),
    actions: maybePresent(() => []),
    bytesReceived: faker.number.int(),
    createdAt: faker.date.past(),
    encoding: faker.lorem.word(),
    ext: faker.lorem.word(),
    mimetype: faker.lorem.word(),
    mode: oneOf(["export", "import"]),
    name: faker.lorem.word(),
    sheetId: maybePresent(() => mkSheetId()()),
    size: faker.number.int(),
    spaceId: mkSpaceId()(),
    status: oneOf(["archived", "complete", "failed", "partial", "purged"]),
    updatedAt: faker.date.past(),
    workbookId: maybePresent(() => mkWorkbookId()()),
  });
}

describe("files", () => {
  it("[Mock] should handle failure when deleting a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.delete(`${baseUrl}/files/${mockFile.id}`, () => {
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
    const resp = await client.files.delete(mockFile.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when deleting a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.delete(`${baseUrl}/files/${mockFile.id}`, () => {
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
    const resp = await client.files.delete(mockFile.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully deleting a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.delete(`${baseUrl}/files/${mockFile.id}`, () => {
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
    const resp = await client.files.delete(mockFile.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it.skip("[Mock] should handle failure when downloading a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.get(`${baseUrl}/files/${mockFile.id}/download`, () => {
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
    const resp = await client.files.download(mockFile.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it.skip("[Mock] should handle decoder errors when downloading a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.get(`${baseUrl}/files/${mockFile.id}/download`, () => {
        return HttpResponse.json(null, { status: 200 });
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.files.download(mockFile.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting string but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it.skip("[Mock] should handle successfully downloading a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.get(`${baseUrl}/files/${mockFile.id}/download`, () => {
        return HttpResponse.json("fileContents", { status: 200 });
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.files.download(mockFile.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual("fileContents"))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.get(`${baseUrl}/files/${mockFile.id}`, () => {
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
    const resp = await client.files.get(mockFile.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.get(`${baseUrl}/files/${mockFile.id}`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockFile,
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
    const resp = await client.files.get(mockFile.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting FileIdFromString at 0.id but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.get(`${baseUrl}/files/${mockFile.id}`, () => {
        return HttpResponse.json(
          {
            data: mockFile,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.files.get(mockFile.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockFile))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching all Files", async () => {
    // setup
    const restHandlers = [
      http.get(`${baseUrl}/files`, () => {
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
    const resp = await client.files.list();

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching all Files", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.get(`${baseUrl}/files`, () => {
        return HttpResponse.json(
          {
            data: [
              {
                ...mockFile,
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
    const resp = await client.files.list();

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting FileIdFromString at 0.0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching all Files", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.get(`${baseUrl}/files`, () => {
        return HttpResponse.json(
          {
            data: [mockFile],
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.files.list();

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual([mockFile]))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when updating a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.patch(`${baseUrl}/files/${mockFile.id}`, () => {
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
    const resp = await client.files.update(mockFile.id, {
      actions: mockFile.actions,
      mode: mockFile.mode,
      name: mockFile.name,
      status: mockFile.status,
      workbookId: mockFile.workbookId,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when updating a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.patch(`${baseUrl}/files/${mockFile.id}`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockFile,
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
    const resp = await client.files.update(mockFile.id, {
      actions: mockFile.actions,
      mode: mockFile.mode,
      name: mockFile.name,
      status: mockFile.status,
      workbookId: mockFile.workbookId,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting FileIdFromString at 0.id but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully updating a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.patch(`${baseUrl}/files/${mockFile.id}`, () => {
        return HttpResponse.json(
          {
            data: mockFile,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.files.update(mockFile.id, {
      actions: mockFile.actions,
      mode: mockFile.mode,
      name: mockFile.name,
      status: mockFile.status,
      workbookId: mockFile.workbookId,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockFile))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when uploading a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.post(`${baseUrl}/files`, () => {
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
    const stream = fs.createReadStream("package.json");
    const resp = await client.files.upload(stream, {
      actions: mockFile.actions,
      environmentId: mkEnvironmentId()(),
      mode: mockFile.mode,
      spaceId: mockFile.spaceId,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when uploading a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.post(`${baseUrl}/files`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockFile,
              id: "bogus_file_id",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const stream = fs.createReadStream("package.json");
    const resp = await client.files.upload(stream, {
      actions: mockFile.actions,
      environmentId: mkEnvironmentId()(),
      mode: mockFile.mode,
      spaceId: mockFile.spaceId,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting FileIdFromString at 0.id but instead got: "bogus_file_id"`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully uploading a File", async () => {
    // setup
    const mockFile: File_ = _mkMockFile()();

    const restHandlers = [
      http.post(`${baseUrl}/files`, () => {
        return HttpResponse.json(
          {
            data: mockFile,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const stream = fs.createReadStream("package.json");
    const resp = await client.files.upload(stream, {
      actions: mockFile.actions,
      environmentId: mkEnvironmentId()(),
      mode: mockFile.mode,
      spaceId: mockFile.spaceId,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockFile))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });
});
