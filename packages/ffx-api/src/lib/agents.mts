import axios, { AxiosError } from "axios";
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
} from "./types.mjs";

// ==================
//   Runtime codecs
// ==================

const EventTopicCodec = t.union([
  t.literal("agent:created"),
  t.literal("agent:deleted"),
  t.literal("agent:updated"),
]);

export const AgentCodec = t.type({
  id: t.string,
  compiler: t.literal("js"),
  source: t.string,
  topics: t.array(EventTopicCodec),
});

// ==================
//       Types
// ==================

export type EventTopic = Readonly<t.TypeOf<typeof EventTopicCodec>>;
export type Agent = Readonly<t.TypeOf<typeof AgentCodec>>;
export type Agents = ReadonlyArray<Agent>;
export type CreateAgentInput = Readonly<Omit<Agent, "id">>;

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
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`${r.baseUrl}/agents`, input, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
              params: {
                environmentId: r.environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data),
    RTE.chain(decodeWith(AgentCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Delete an `Agent`.
 *
 * @since 0.1.0
 */
export function deleteAgent(
  agentId: string,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/agents/${agentId}`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
              params: {
                environmentId: r.environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.type({ success: t.boolean }))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get an `Agent`.
 *
 * @since 0.1.0
 */
export function getAgent(
  agentId: string,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Agent>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/agents/${agentId}`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
              params: {
                environmentId: r.environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(AgentCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
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
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/agents`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
              params: {
                environmentId: r.environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(AgentCodec))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
