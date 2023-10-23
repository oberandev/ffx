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
  mkFileId,
  mkJobId,
  mkSheetId,
  mkWorkbookId,
  oneOf,
} from "./helpers.mjs";
import { Job } from "../src/lib/jobs.mjs";

function _mkMockJob(): IO.IO<Job> {
  return IO.of({
    id: mkJobId()(),
    config: maybePresent(() => ({})),
    createdAt: faker.date.past(),
    destination: maybePresent(() => mkWorkbookId()()),
    environmentId: maybePresent(() => mkEnvironmentId()()),
    estimatedCompletionAt: maybePresent(() => oneOf([faker.date.future(), null])),
    fileId: maybePresent(() => mkFileId()()),
    finishedAt: maybePresent(() => oneOf([faker.date.past(), null])),
    fromAction: maybePresent(() => ({
      confirm: maybePresent(() => oneOf([false, true])),
      description: maybePresent(() => faker.lorem.word()),
      icon: maybePresent(() => faker.lorem.word()),
      inputForm: maybePresent(() => ({})),
      label: faker.lorem.word(),
      mode: maybePresent(() => oneOf(["background", "foreground"])),
      operation: maybePresent(() => faker.lorem.word()),
      primary: maybePresent(() => oneOf([false, true])),
      requireAllValid: maybePresent(() => oneOf([false, true])),
      requireSelection: maybePresent(() => oneOf([false, true])),
      schedule: maybePresent(() => oneOf(["daily", "hourly", "weekly"])),
      tooltip: maybePresent(() => faker.lorem.word()),
    })),
    info: maybePresent(() => faker.lorem.word()),
    input: maybePresent(() => ({})),
    managed: maybePresent(() => oneOf([false, true])),
    mode: maybePresent(() => oneOf(["background", "foreground"])),
    operation: faker.lorem.word(),
    outcome: maybePresent(() => ({
      acknowledge: oneOf([false, true]),
      buttonText: faker.lorem.word(),
      heading: faker.lorem.word(),
      message: faker.lorem.word(),
      next: oneOf([
        {
          id: faker.lorem.word(),
          label: maybePresent(() => faker.lorem.word()),
          type: "id",
        },
        {
          label: maybePresent(() => faker.lorem.word()),
          type: "url",
          url: faker.internet.url(),
        },
        {
          fileName: maybePresent(() => faker.lorem.word()),
          label: maybePresent(() => faker.lorem.word()),
          type: "download",
          url: faker.internet.url(),
        },
        {
          type: "wait",
        },
      ]),
    })),
    outcomeAcknowledgedAt: maybePresent(() => oneOf([faker.date.past(), null])),
    progress: maybePresent(() => faker.number.int()),
    source: oneOf([mkFileId()(), mkSheetId()(), mkWorkbookId()()]),
    startedAt: maybePresent(() => oneOf([faker.date.past(), null])),
    status: maybePresent(() =>
      oneOf([
        "canceled",
        "complete",
        "created",
        "executing",
        "failed",
        "planning",
        "ready",
        "scheduled",
      ]),
    ),
    subject: maybePresent(() =>
      oneOf([
        {
          params: maybePresent(() => ({})),
          query: maybePresent(() => ({})),
          resource: faker.lorem.word(),
          type: oneOf(["collection", "resource"]),
        },
        {
          id: faker.lorem.word(),
          type: oneOf(["collection", "resource"]),
        },
      ]),
    ),
    trigger: maybePresent(() => oneOf(["immediate", "manual"])),
    type: oneOf(["file", "sheet", "space", "workbook"]),
    updatedAt: faker.date.past(),
  });
}

describe("jobs", () => {
  it("[Mock] should handle failure when acknowledging a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/ack`, () => {
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
    const resp = await client.jobs.ack(mockJob.id, {
      estimatedCompletionAt: new Date(),
      info: mockJob.info,
      progress: mockJob.progress,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when acknowledging a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/ack`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockJob,
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
    const resp = await client.jobs.ack(mockJob.id, {
      estimatedCompletionAt: new Date(),
      info: mockJob.info,
      progress: mockJob.progress,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting JobIdFromString at 0.id but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully acknowledging a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/ack`, () => {
        return HttpResponse.json(
          {
            data: mockJob,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.ack(mockJob.id, {
      estimatedCompletionAt: new Date(),
      info: mockJob.info,
      progress: mockJob.progress,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when acknowledging the outcome of a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/outcome/ack`, () => {
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
    const resp = await client.jobs.ackOutcome(mockJob.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when acknowledging the outcome of a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/outcome/ack`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockJob,
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
    const resp = await client.jobs.ackOutcome(mockJob.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting JobIdFromString at 0.id but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully acknowledging the outcome of a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/outcome/ack`, () => {
        return HttpResponse.json(
          {
            data: mockJob,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.ackOutcome(mockJob.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when cancelling a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/cancel`, () => {
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
    const resp = await client.jobs.cancel(mockJob.id, {
      info: mockJob.info,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when cancelling a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/cancel`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockJob,
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
    const resp = await client.jobs.cancel(mockJob.id, {
      info: mockJob.info,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting JobIdFromString at 0.id but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully cancelling a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/cancel`, () => {
        return HttpResponse.json(
          {
            data: mockJob,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.cancel(mockJob.id, {
      info: mockJob.info,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when completing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/complete`, () => {
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
    const resp = await client.jobs.complete(mockJob.id, {
      info: mockJob.info,
      outcome: mockJob.outcome,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when completing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/complete`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockJob,
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
    const resp = await client.jobs.complete(mockJob.id, {
      info: mockJob.info,
      outcome: mockJob.outcome,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting JobIdFromString at 0.id but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully completing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/complete`, () => {
        return HttpResponse.json(
          {
            data: mockJob,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.complete(mockJob.id, {
      info: mockJob.info,
      outcome: mockJob.outcome,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when creating a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs`, () => {
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
    const resp = await client.jobs.create({
      config: mockJob.config,
      destination: mockJob.destination,
      environmentId: mockJob.environmentId,
      fileId: mockJob.fileId,
      fromAction: mockJob.fromAction,
      info: mockJob.info,
      input: mockJob.input,
      managed: mockJob.managed,
      mode: mockJob.mode,
      operation: mockJob.operation,
      outcome: mockJob.outcome,
      progress: mockJob.progress,
      source: mockJob.source,
      status: mockJob.status,
      subject: mockJob.subject,
      trigger: mockJob.trigger,
      type: mockJob.type,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when creating a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockJob,
              id: "bogus_job_id",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.create({
      config: mockJob.config,
      destination: mockJob.destination,
      environmentId: mockJob.environmentId,
      fileId: mockJob.fileId,
      fromAction: mockJob.fromAction,
      info: mockJob.info,
      input: mockJob.input,
      managed: mockJob.managed,
      mode: mockJob.mode,
      operation: mockJob.operation,
      outcome: mockJob.outcome,
      progress: mockJob.progress,
      source: mockJob.source,
      status: mockJob.status,
      subject: mockJob.subject,
      trigger: mockJob.trigger,
      type: mockJob.type,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting JobIdFromString at 0.id but instead got: "bogus_job_id"`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully creating a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs`, () => {
        return HttpResponse.json(
          {
            data: mockJob,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.create({
      config: mockJob.config,
      destination: mockJob.destination,
      environmentId: mockJob.environmentId,
      fileId: mockJob.fileId,
      fromAction: mockJob.fromAction,
      info: mockJob.info,
      input: mockJob.input,
      managed: mockJob.managed,
      mode: mockJob.mode,
      operation: mockJob.operation,
      outcome: mockJob.outcome,
      progress: mockJob.progress,
      source: mockJob.source,
      status: mockJob.status,
      subject: mockJob.subject,
      trigger: mockJob.trigger,
      type: mockJob.type,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when deleting a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.delete(`${baseUrl}/jobs/${mockJob.id}`, () => {
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
    const resp = await client.jobs.delete(mockJob.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when deleting a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.delete(`${baseUrl}/jobs/${mockJob.id}`, () => {
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
    const resp = await client.jobs.delete(mockJob.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully deleting a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.delete(`${baseUrl}/jobs/${mockJob.id}`, () => {
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
    const resp = await client.jobs.delete(mockJob.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when executing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/execute`, () => {
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
    const resp = await client.jobs.execute(mockJob.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when executing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/execute`, () => {
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
    const resp = await client.jobs.execute(mockJob.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully executing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/execute`, () => {
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
    const resp = await client.jobs.execute(mockJob.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when failing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/fail`, () => {
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
    const resp = await client.jobs.fail(mockJob.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when failing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/fail`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockJob,
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
    const resp = await client.jobs.fail(mockJob.id, {
      outcome: mockJob.outcome,
      info: mockJob.info,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting JobIdFromString at 0.id but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully failing a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.post(`${baseUrl}/jobs/${mockJob.id}/fail`, () => {
        return HttpResponse.json(
          {
            data: mockJob,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.fail(mockJob.id, {
      outcome: mockJob.outcome,
      info: mockJob.info,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.get(`${baseUrl}/jobs/${mockJob.id}`, () => {
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
    const resp = await client.jobs.get(mockJob.id);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.get(`${baseUrl}/jobs/${mockJob.id}`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockJob,
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
    const resp = await client.jobs.get(mockJob.id);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting JobIdFromString at 0.id but instead got: null`]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.get(`${baseUrl}/jobs/${mockJob.id}`, () => {
        return HttpResponse.json(
          {
            data: mockJob,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.get(mockJob.id);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching all Jobs", async () => {
    // setup
    const restHandlers = [
      http.get(`${baseUrl}/jobs`, () => {
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
    const resp = await client.jobs.list();

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching all Jobs", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.get(`${baseUrl}/jobs`, () => {
        return HttpResponse.json(
          {
            data: [
              {
                ...mockJob,
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
    const resp = await client.jobs.list();

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting JobIdFromString at 0.0.id but instead got: null`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching all Jobs", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.get(`${baseUrl}/jobs`, () => {
        return HttpResponse.json(
          {
            data: [mockJob],
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.list();

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual([mockJob]))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when updating a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.patch(`${baseUrl}/jobs/${mockJob.id}`, () => {
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
    const resp = await client.jobs.update(mockJob.id, {
      config: mockJob.config,
      outcomeAcknowledgedAt: new Date(),
      progress: mockJob.progress,
      status: mockJob.status,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when updating a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.patch(`${baseUrl}/jobs/${mockJob.id}`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockJob,
              id: "bogus_job_id",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.update(mockJob.id, {
      config: mockJob.config,
      outcomeAcknowledgedAt: new Date(),
      progress: mockJob.progress,
      status: mockJob.status,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting JobIdFromString at 0.id but instead got: "bogus_job_id"`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully updating a Job", async () => {
    // setup
    const mockJob: Job = _mkMockJob()();

    const restHandlers = [
      http.patch(`${baseUrl}/jobs/${mockJob.id}`, () => {
        return HttpResponse.json(
          {
            data: mockJob,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.update(mockJob.id, {
      config: mockJob.config,
      outcomeAcknowledgedAt: new Date(),
      progress: mockJob.progress,
      status: mockJob.status,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });
});
