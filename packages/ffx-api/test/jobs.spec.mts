import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
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
import { Job, Jobs } from "../src/lib/jobs.mjs";

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
      rest.post(`${baseUrl}/jobs/${mockJob.id}/ack`, (_req, res, ctx) => {
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
    const resp = await client.jobs.ack(mockJob.id, {
      estimatedCompletionAt: new Date(),
      reason: mockJob.info,
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
      rest.post(`${baseUrl}/jobs/${mockJob.id}/ack`, (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: {
              ...mockJob,
              id: null,
            },
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.ack(mockJob.id, {
      estimatedCompletionAt: new Date(),
      reason: mockJob.info,
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
      rest.post(`${baseUrl}/jobs/${mockJob.id}/ack`, (_req, res, ctx) => {
        return res(
          ctx.status(200),
          ctx.json({
            data: mockJob,
          }),
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.jobs.ack(mockJob.id, {
      estimatedCompletionAt: new Date(),
      reason: mockJob.info,
      progress: mockJob.progress,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toEqual(mockJob))
      .otherwise(() => assert.fail(`Received unexpected:\n${JSON.stringify(resp, null, 2)}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when acknowledging the outcome of a Job", async () => {});

  it("[Mock] should handle failure when cancelling a Job", async () => {});

  it("[Mock] should handle failure when completing a Job", async () => {});

  it("[Mock] should handle failure when creating a Job", async () => {});

  it("[Mock] should handle failure when deleting a Job", async () => {});

  it("[Mock] should handle failure when executing a Job", async () => {});

  it("[Mock] should handle failure when failing a Job", async () => {});

  it("[Mock] should handle failure when fetching a Job", async () => {});

  it("[Mock] should handle failure when listing Jobs", async () => {});

  it("[Mock] should handle failure when updating a Job", async () => {});
});
