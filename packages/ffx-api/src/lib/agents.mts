import { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import {
  ApiReader,
  DecoderErrors,
  HttpError,
  Successful,
  decodeWith,
  mkHttpError,
} from "./http.mjs";
import { AgentId, AgentIdFromString } from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

const EventTopicC = t.union([
  t.literal("agent:created"),
  t.literal("agent:deleted"),
  t.literal("agent:updated"),
  t.literal("commit:completed"),
  t.literal("commit:created"),
  t.literal("commit:updated"),
  t.literal("document:created"),
  t.literal("document:deleted"),
  t.literal("document:updated"),
  t.literal("file:created"),
  t.literal("file:deleted"),
  t.literal("file:updated"),
  t.literal("job:completed"),
  t.literal("job:created"),
  t.literal("job:deleted"),
  t.literal("job:failed"),
  t.literal("job:outcome-acknowledged"),
  t.literal("job:ready"),
  t.literal("job:scheduled"),
  t.literal("job:updated"),
  t.literal("layer:created"),
  t.literal("records:created"),
  t.literal("records:deleted"),
  t.literal("records:updated"),
  t.literal("sheet:created"),
  t.literal("sheet:deleted"),
  t.literal("sheet:updated"),
  t.literal("snapshot:created"),
  t.literal("space:created"),
  t.literal("space:deleted"),
  t.literal("space:updated"),
  t.literal("workbook:created"),
  t.literal("workbook:deleted"),
  t.literal("workbook:updated"),
]);

export const AgentC = t.type({
  id: AgentIdFromString,
  compiler: t.literal("js"),
  source: t.string,
  topics: t.array(EventTopicC),
});

const CreateAgentInputC = t.exact(
  t.type({
    compiler: t.literal("js"),
    source: t.string,
    topics: t.array(EventTopicC),
  }),
);

// ==================
//       Types
// ==================

export type Agent = Readonly<t.TypeOf<typeof AgentC>>;
export type Agents = ReadonlyArray<Agent>;
export type EventTopic = Readonly<t.TypeOf<typeof EventTopicC>>;

export type CreateAgentInput = Readonly<t.TypeOf<typeof CreateAgentInputC>>;

// ==================
//       Main
// ==================

/**
 * Create an `Agent`.
 *
 * @since 0.1.0
 */
export function createAgent(
  input: CreateAgentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Agent>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/agents`, input, {
              params: {
                environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data),
    RTE.chain(decodeWith(AgentC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Delete an `Agent`.
 *
 * @since 0.1.0
 */
export function deleteAgent(
  agentId: AgentId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`/agents/${agentId}`, {
              params: {
                environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.type({ success: t.boolean }))),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get an `Agent`.
 *
 * @since 0.1.0
 */
export function getAgent(
  agentId: AgentId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Agent>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`/agents/${agentId}`, {
              params: {
                environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(AgentC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a list of `Agent`s.
 *
 * @since 0.1.0
 */
export function listAgents(): RT.ReaderTask<
  ApiReader,
  DecoderErrors | HttpError | Successful<Agents>
> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`/agents`, {
              params: {
                environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(AgentC))),
    RTE.matchW(mkHttpError, identity),
  );
}
