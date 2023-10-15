import { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import { EventTopicC } from "./events.mjs";
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

const AgentC = t.type({
  id: AgentIdFromString,
  compiler: t.literal("js"),
  source: t.string,
  topics: t.array(EventTopicC),
});

/*
 * Typescript doesn't offer an Exact<T> type, so we'll use `t.exact` & `t.strict`
 * to strip addtional properites. Sadly the compiler can't enfore this, so the input
 * must be separated into its constituent parts when contstructing the HTTP call
 * to ensure user inputs don't break the API by passing extra data.
 */

const CreateAgentInputC = t.strict({
  compiler: t.literal("js"),
  source: t.string,
  topics: t.array(EventTopicC),
});

// ==================
//       Types
// ==================

export type Agent = Readonly<t.TypeOf<typeof AgentC>>;
export type Agents = ReadonlyArray<Agent>;

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
            return axios.post(
              `/agents`,
              {
                compiler: input.compiler,
                source: input.source,
                topics: input.topics,
              },
              {
                params: {
                  environmentId,
                },
              },
            );
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
