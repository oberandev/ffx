import axios, { AxiosError } from "axios";
import * as E from "fp-ts/lib/Either.js";
import { flow, identity, pipe } from "fp-ts/lib/function.js";
import * as RT from "fp-ts/lib/ReaderTask.js";
import * as RTE from "fp-ts/lib/ReaderTaskEither.js";
import * as TE from "fp-ts/lib/TaskEither.js";
import * as t from "io-ts/lib";
import { formatValidationErrors } from "io-ts-reporters";

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

const HttpMethodCodec = t.union([
  t.literal("DELETE"),
  t.literal("GET"),
  t.literal("PATCH"),
  t.literal("POST"),
  t.literal("PUT"),
]);

// ==================
//       Types
// ==================

export type EventTopic = Readonly<t.TypeOf<typeof EventTopicCodec>>;
export type Agent = Readonly<t.TypeOf<typeof AgentCodec>>;
export type Agents = ReadonlyArray<Agent>;
export type CreateAgentInput = Readonly<Omit<Agent, "id">>;

export interface ApiReader {
  readonly baseUrl: string;
  readonly environmentId: string;
  readonly pkgJson: Readonly<{
    name: string;
    version: string;
  }>;
  readonly secret: string;
}

export interface DecoderErrors {
  readonly _tag: "decoder_errors";
  readonly reasons: ReadonlyArray<string>;
}

export interface HttpError {
  readonly _tag: "http_error";
  readonly method: string;
  readonly reason: string;
  readonly statusCode: number;
  readonly url: string;
  readonly version: string;
}

export interface Successful<T> {
  _tag: "successful";
  data: T;
}

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
    RTE.chain(_decodeWith(AgentCodec)),
    RTE.matchW((axiosError) => _mkHttpError(axiosError), identity),
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
    RTE.chain(_decodeWith(t.type({ success: t.boolean }))),
    RTE.matchW((axiosError) => _mkHttpError(axiosError), identity),
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
    RTE.chain(_decodeWith(AgentCodec)),
    RTE.matchW((axiosError) => _mkHttpError(axiosError), identity),
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
    RTE.chain(_decodeWith(t.array(AgentCodec))),
    RTE.matchW((axiosError) => _mkHttpError(axiosError), identity),
  );
}

// ==================
//      Helpers
// ==================

function _decodeWith<A>(codec: t.Type<A>) {
  return flow<
    [i: unknown],
    t.Validation<A>,
    DecoderErrors | Successful<A>,
    RTE.ReaderTaskEither<ApiReader, AxiosError, DecoderErrors | Successful<A>>
  >(
    codec.decode,
    E.matchW(
      (decoderErrors) => _mkDecoderErrors(formatValidationErrors(decoderErrors)),
      (data) => _mkSuccessful(data),
    ),
    RTE.of,
  );
}

function _mkDecoderErrors(reasons: ReadonlyArray<string>): DecoderErrors {
  return {
    _tag: "decoder_errors",
    reasons,
  };
}

function _mkSuccessful<T>(data: T): Successful<T> {
  return {
    _tag: "successful",
    data,
  };
}

function _mkHttpError(error: AxiosError): HttpError {
  return {
    _tag: "http_error",
    method: pipe(
      HttpMethodCodec.decode(error.config?.method?.toUpperCase()),
      E.getOrElseW(() => "Unsupported method"),
    ),
    reason: error.message,
    statusCode: pipe(
      t.number.decode(error.response?.status),
      E.getOrElse(() => 418), // 🫖
    ),
    url: pipe(
      t.string.decode(error.config?.url),
      E.getOrElse(() => "https://platform.flatfile.com/api/v1"),
    ),
    version: pipe(
      t.string.decode(error.config?.headers["User-Agent"]?.toString()),
      E.getOrElse(() => "axios"),
    ),
  };
}
