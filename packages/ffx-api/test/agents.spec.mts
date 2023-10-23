import { faker } from "@faker-js/faker";
import * as IO from "fp-ts/IO";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import { baseUrl, client, mkAgentId, mkEnvironmentId, multipleOf } from "./helpers.mjs";
import { Agent, Agents } from "../src/lib/agents.mjs";
import { EnvironmentId } from "../src/lib/ids.mjs";

function _mkMockAgent(): IO.IO<Agent> {
  return IO.of({
    id: mkAgentId()(),
    compiler: "js",
    source: faker.lorem.paragraphs(2),
    topics: multipleOf([
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

describe("agents", () => {
  it("[Mock] should handle failure when creating an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.post(`${baseUrl}/agents`, () => {
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
    const resp = await client.agents.create({
      environmentId: mkEnvironmentId()(),
      source: mockAgent.source,
    });

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when creating an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.post(`${baseUrl}/agents`, () => {
        return HttpResponse.json(
          {
            ...mockAgent,
            id: "bogus_agent_id",
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.agents.create({
      environmentId: mkEnvironmentId()(),
      source: mockAgent.source,
    });

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([
          `Expecting AgentIdFromString at id but instead got: "bogus_agent_id"`,
        ]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully creating an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.post(`${baseUrl}/agents`, () => {
        return HttpResponse.json(mockAgent, { status: 200 });
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const resp = await client.agents.create({
      environmentId: mkEnvironmentId()(),
      source: mockAgent.source,
    });

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockAgent))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when deleting an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.delete(`${baseUrl}/agents/${mockAgent.id}`, () => {
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
    const resp = await client.agents.delete(mockAgent.id, environmentId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when deleting an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.delete(`${baseUrl}/agents/${mockAgent.id}`, () => {
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
    const environmentId: EnvironmentId = mkEnvironmentId()();
    const resp = await client.agents.delete(mockAgent.id, environmentId);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully deleting an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.delete(`${baseUrl}/agents/${mockAgent.id}`, () => {
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
    const environmentId: EnvironmentId = mkEnvironmentId()();
    const resp = await client.agents.delete(mockAgent.id, environmentId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.get(`${baseUrl}/agents/${mockAgent.id}`, () => {
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
    const resp = await client.agents.get(mockAgent.id, environmentId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.get(`${baseUrl}/agents/${mockAgent.id}`, () => {
        return HttpResponse.json(
          {
            data: {
              ...mockAgent,
              compiler: "ts",
            },
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const environmentId: EnvironmentId = mkEnvironmentId()();
    const resp = await client.agents.get(mockAgent.id, environmentId);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual([`Expecting "js" at compiler but instead got: "ts"`]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching an Agent", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.get(`${baseUrl}/agents/${mockAgent.id}`, () => {
        return HttpResponse.json(
          {
            data: mockAgent,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const environmentId: EnvironmentId = mkEnvironmentId()();
    const resp = await client.agents.get(mockAgent.id, environmentId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockAgent))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle failure when fetching all Agents", async () => {
    // setup
    const restHandlers = [
      http.get(`${baseUrl}/agents`, () => {
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
    const resp = await client.agents.list(environmentId);

    match(resp)
      .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle decoder errors when fetching all Agents", async () => {
    // setup
    const mockAgent: Agent = _mkMockAgent()();

    const restHandlers = [
      http.get(`${baseUrl}/agents`, () => {
        return HttpResponse.json(
          {
            data: [
              {
                ...mockAgent,
                source: null,
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
    const resp = await client.agents.list(environmentId);

    match(resp)
      .with({ _tag: "decoder_errors" }, ({ reasons }) =>
        expect(reasons).toStrictEqual(["Expecting string at 0.source but instead got: null"]),
      )
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });

  it("[Mock] should handle successfully fetching all Agents", async () => {
    // setup
    const mockAgents: Agents = Array.from({ length: 2 }, () => _mkMockAgent()());

    const restHandlers = [
      http.get(`${baseUrl}/agents`, () => {
        return HttpResponse.json(
          {
            data: mockAgents,
          },
          { status: 200 },
        );
      }),
    ];

    const server = setupServer(...restHandlers);
    server.listen({ onUnhandledRequest: "error" });

    // test
    const environmentId: EnvironmentId = mkEnvironmentId()();
    const resp = await client.agents.list(environmentId);

    match(resp)
      .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockAgents))
      .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

    // teardown
    server.close();
  });
});
