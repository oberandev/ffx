import { faker } from "@faker-js/faker";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import * as IO from "fp-ts/IO";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { match } from "ts-pattern";

import { baseUrl, client, mkAgentId } from "./helpers.mjs";
import { Agent, AgentC, Agents } from "../src/lib/agents.mjs";
import { AgentIdFromString } from "../src/lib/ids.mjs";

function _mkMockAgent(): IO.IO<Agent> {
  return IO.of({
    id: mkAgentId()(),
    compiler: "js",
    source: faker.lorem.paragraphs(2),
    topics: ["agent:created"],
  });
}

describe("agents", () => {
  describe("[Codecs]", () => {
    it("Agent", () => {
      const decoded = pipe(_mkMockAgent()(), AgentC.decode);

      expect(E.isRight(decoded)).toBe(true);
    });

    it("AgentId", () => {
      const brandedT = mkAgentId()();

      expect(AgentIdFromString.is(brandedT)).toBe(true);
    });
  });

  describe("[Mocks]", () => {
    it("should handle failure when creating an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.post(`${baseUrl}/agents`, (_req, res, ctx) => {
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
      const resp = await client.agents.create(mockAgent);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when creating an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.post(`${baseUrl}/agents`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              ...mockAgent,
              id: "bogus_agent_id",
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.agents.create(mockAgent);

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

    it("should handle successfully creating an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.post(`${baseUrl}/agents`, (_req, res, ctx) => {
          return res(ctx.status(200), ctx.json(mockAgent));
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.agents.create(mockAgent);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockAgent))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle failure when deleting an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.delete(`${baseUrl}/agents/${mockAgent.id}`, (_req, res, ctx) => {
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
      const resp = await client.agents.delete(mockAgent.id);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when deleting an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.delete(`${baseUrl}/agents/${mockAgent.id}`, (_req, res, ctx) => {
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
      const resp = await client.agents.delete(mockAgent.id);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting boolean at success but instead got: "foobar"`]),
        )
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle successfully deleting an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.delete(`${baseUrl}/agents/${mockAgent.id}`, (_req, res, ctx) => {
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
      const resp = await client.agents.delete(mockAgent.id);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual({ success: true }))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.get(`${baseUrl}/agents/${mockAgent.id}`, (_req, res, ctx) => {
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
      const resp = await client.agents.get(mockAgent.id);

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when fetching an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.get(`${baseUrl}/agents/${mockAgent.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: {
                ...mockAgent,
                compiler: "ts",
              },
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.agents.get(mockAgent.id);

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual([`Expecting "js" at compiler but instead got: "ts"`]),
        )
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching an Agent", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.get(`${baseUrl}/agents/${mockAgent.id}`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockAgent,
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.agents.get(mockAgent.id);

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockAgent))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle failure when fetching all Agents", async () => {
      // setup
      const restHandlers = [
        rest.get(`${baseUrl}/agents`, (_req, res, ctx) => {
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
      const resp = await client.agents.list();

      match(resp)
        .with({ _tag: "http_error" }, (httpError) => expect(httpError.statusCode).toEqual(400))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle decoder errors when fetching all Agents", async () => {
      // setup
      const mockAgent: Agent = _mkMockAgent()();

      const restHandlers = [
        rest.get(`${baseUrl}/agents`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: [{ ...mockAgent, source: null }],
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.agents.list();

      match(resp)
        .with({ _tag: "decoder_errors" }, ({ reasons }) =>
          expect(reasons).toStrictEqual(["Expecting string at 0.source but instead got: null"]),
        )
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });

    it("should handle successfully fetching all Agents", async () => {
      // setup
      const mockAgents: Agents = Array.from({ length: 2 }, () => _mkMockAgent()());

      const restHandlers = [
        rest.get(`${baseUrl}/agents`, (_req, res, ctx) => {
          return res(
            ctx.status(200),
            ctx.json({
              data: mockAgents,
            }),
          );
        }),
      ];

      const server = setupServer(...restHandlers);
      server.listen({ onUnhandledRequest: "error" });

      // test
      const resp = await client.agents.list();

      match(resp)
        .with({ _tag: "successful" }, ({ data }) => expect(data).toStrictEqual(mockAgents))
        .otherwise(() => assert.fail(`Received unexpected tag: ${resp._tag}`));

      // teardown
      server.close();
    });
  });
});
