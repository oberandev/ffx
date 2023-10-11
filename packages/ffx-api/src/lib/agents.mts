import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as Str from "fp-ts/string";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { Iso } from "monocle-ts";
import { Newtype, iso } from "newtype-ts";

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

const EventTopicC = t.union(
  [
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
  ],
  "EventTopicC",
);

export interface AgentId extends Newtype<{ readonly AgentId: unique symbol }, string> {}

export const isoAgentId: Iso<AgentId, string> = iso<AgentId>();

export const AgentIdFromString = new t.Type<AgentId>(
  "AgentIdFromString",
  (input: unknown): input is AgentId => {
    return Str.isString(input) && /^us_ag_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_ag_\w{8}$/g.test(input)
      ? t.success(isoAgentId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export const AgentC = t.type(
  {
    id: AgentIdFromString,
    compiler: t.literal("js"),
    source: t.string,
    topics: t.array(EventTopicC),
  },
  "AgentC",
);

// ==================
//       Types
// ==================

export type Agent = Readonly<t.TypeOf<typeof AgentC>>;
export type Agents = ReadonlyArray<Agent>;
export type EventTopic = Readonly<t.TypeOf<typeof EventTopicC>>;
export type CreateAgentInput = Omit<Agent, "id">;

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
    RTE.chain(decodeWith(AgentC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
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
  agentId: AgentId,
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
    RTE.chain(decodeWith(AgentC)),
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
    RTE.chain(decodeWith(t.array(AgentC))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
