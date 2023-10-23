import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import {
  baseUrl,
  client,
  maybePresent,
  mkAccountId,
  mkAgentId,
  mkDocumentId,
  mkEnvironmentId,
  mkEventId,
  mkFileId,
  mkGuestId,
  mkJobId,
  mkSheetId,
  mkSnapshotId,
  mkSpaceId,
  mkUserId,
  mkVersionId,
  mkWorkbookId,
  oneOf,
} from "./helpers.mjs";
import { Event } from "../src/lib/events.mjs";

function _mkMockEvent(): IO.IO<Event> {
  return IO.of({
    id: mkEventId()(),
    acknowledgedAt: maybePresent(() => oneOf([faker.date.past(), null])),
    acknowledgedBy: maybePresent(() => mkUserId()()),
    attributes: maybePresent(() => ({
      progress: maybePresent(() => ({
        current: maybePresent(() => faker.number.int()),
        percent: maybePresent(() => faker.number.int()),
        total: maybePresent(() => faker.number.int()),
      })),
      targetUpdatedAt: maybePresent(() => faker.date.past()),
    })),
    callbackUrl: maybePresent(() => faker.internet.url()),
    context: {
      accountId: mkAccountId()(),
      environmentId: mkEnvironmentId()(),
      actionName: maybePresent(() => faker.lorem.word()),
      actorId: maybePresent(() => oneOf([mkAgentId()(), mkGuestId()(), mkUserId()()])),
      documentId: maybePresent(() => mkDocumentId()()),
      fileId: maybePresent(() => mkFileId()()),
      jobId: maybePresent(() => mkJobId()()),
      namespaces: maybePresent(() => [faker.lorem.word()]),
      precedingEventId: maybePresent(() => mkEventId()()),
      sheetId: maybePresent(() => mkSheetId()()),
      slugs: maybePresent(() => ({
        sheet: maybePresent(() => faker.lorem.word()),
        space: maybePresent(() => faker.lorem.word()),
        workbook: maybePresent(() => faker.lorem.word()),
      })),
      snapshotId: maybePresent(() => mkSnapshotId()()),
      spaceId: maybePresent(() => mkSpaceId()()),
      versionId: maybePresent(() => mkVersionId()()),
      workbookId: maybePresent(() => mkWorkbookId()()),
    },
    createdAt: faker.date.past(),
    dataUrl: maybePresent(() => faker.internet.url()),
    deletedAt: maybePresent(() => faker.date.past()),
    domain: oneOf(["document", "file", "job", "sheet", "space", "workbook"]),
    namespaces: [faker.lorem.word()],
    origin: maybePresent(() => ({
      id: maybePresent(() => faker.lorem.word()),
      slug: maybePresent(() => faker.lorem.word()),
    })),
    payload: {},
    topic: oneOf([
      "agent:created",
      "agent:deleted",
      "agent:updated",
      "commit:completed",
      "commit:created",
      "commit:updated",
      "document:created",
      "document:deleted",
      "document:updated",
      "file:created",
      "file:deleted",
      "file:updated",
      "job:completed",
      "job:created",
      "job:deleted",
      "job:failed",
      "job:outcome-acknowledged",
      "job:ready",
      "job:scheduled",
      "job:updated",
      "layer:created",
      "records:created",
      "records:deleted",
      "records:updated",
      "sheet:created",
      "sheet:deleted",
      "sheet:updated",
      "snapshot:created",
      "space:created",
      "space:deleted",
      "space:updated",
      "workbook:created",
      "workbook:deleted",
      "workbook:updated",
    ]),
  });
}

describe("events", () => {
  it("[Mock] should handle failure when acknowleding an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.post(`${baseUrl}/events/${mockEvent.id}`, () => {
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
    const resp = await client.events.ack(mockEvent.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when acknowleding an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.post(`${baseUrl}/events/${mockEvent.id}`, () => {
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
    const resp = await client.events.ack(mockEvent.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully acknowleding an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.post(`${baseUrl}/events/${mockEvent.id}`, () => {
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
    const resp = await client.events.ack(mockEvent.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when creating an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.post(`${baseUrl}/events`, () => {
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
    const resp = await client.events.create({
      attributes: mockEvent.attributes,
      callbackUrl: mockEvent.callbackUrl,
      context: mockEvent.context,
      dataUrl: mockEvent.dataUrl,
      domain: mockEvent.domain,
      origin: mockEvent.origin,
      payload: {},
      topic: mockEvent.topic,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when creating an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.post(`${baseUrl}/events`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockEvent,
              id: "bogus_event_id",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.events.create({
      attributes: mockEvent.attributes,
      callbackUrl: mockEvent.callbackUrl,
      context: mockEvent.context,
      dataUrl: mockEvent.dataUrl,
      domain: mockEvent.domain,
      origin: mockEvent.origin,
      payload: {},
      topic: mockEvent.topic,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting EventIdFromString at 0.id but instead got: "bogus_event_id"`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully creating an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.post(`${baseUrl}/events`, () => {
        return HttpResponse.json(
          {
            data: mockEvent,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.events.create({
      attributes: mockEvent.attributes,
      callbackUrl: mockEvent.callbackUrl,
      context: mockEvent.context,
      dataUrl: mockEvent.dataUrl,
      domain: mockEvent.domain,
      origin: mockEvent.origin,
      payload: {},
      topic: mockEvent.topic,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockEvent))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.get(`${baseUrl}/events/${mockEvent.id}`, () => {
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
    const resp = await client.events.get(mockEvent.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.get(`${baseUrl}/events/${mockEvent.id}`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockEvent,
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
    const resp = await client.events.get(mockEvent.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting EventIdFromString at 0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching an Event", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.get(`${baseUrl}/events/${mockEvent.id}`, () => {
        return HttpResponse.json(
          {
            data: mockEvent,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.events.get(mockEvent.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockEvent))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching all Events", async () => {
    // setup
    const restHandlers = [
      http.get(`${baseUrl}/events`, () => {
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
    const resp = await client.events.list();

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching all Events", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.get(`${baseUrl}/events`, () => {
        return HttpResponse.json(
          {
            data: [
              {
                ...mockEvent,
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
    const resp = await client.events.list();

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting EventIdFromString at 0.0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching all Events", async () => {
    // setup
    const mockEvent: Event = _mkMockEvent()();

    const restHandlers = [
      http.get(`${baseUrl}/events`, () => {
        return HttpResponse.json(
          {
            data: [mockEvent],
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.events.list();

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual([mockEvent]))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });
});
