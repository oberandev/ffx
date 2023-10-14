import { Axios, AxiosError } from "axios";
import * as E from "fp-ts/Either";
import { flow, pipe } from "fp-ts/function";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as t from "io-ts";
import { formatValidationErrors } from "io-ts-reporters";

import { EnvironmentId } from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

const HttpMethodC = t.union([
  t.literal("DELETE"),
  t.literal("GET"),
  t.literal("PATCH"),
  t.literal("POST"),
  t.literal("PUT"),
]);

// ==================
//       Types
// ==================

export interface ApiReader {
  readonly axios: Axios;
  readonly environmentId: EnvironmentId;
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
  readonly _tag: "successful";
  readonly data: T;
}

// ==================
//      Helpers
// ==================

export function decodeWith<A>(codec: t.Decoder<unknown, A>) {
  return flow<
    [i: unknown],
    t.Validation<A>,
    DecoderErrors | Successful<A>,
    RTE.ReaderTaskEither<ApiReader, AxiosError, DecoderErrors | Successful<A>>
  >(codec.decode, E.matchW(flow(formatValidationErrors, _mkDecoderErrors), _mkSuccessful), RTE.of);
}

const _mkDecoderErrors = flow(
  (reasons: ReadonlyArray<string>): DecoderErrors => ({
    _tag: "decoder_errors",
    reasons,
  }),
);

const _mkSuccessful = flow(
  <T,>(data: T): Successful<T> => ({
    _tag: "successful",
    data,
  }),
);

export const mkHttpError = flow(
  (error: AxiosError): HttpError => ({
    _tag: "http_error",
    method: pipe(
      HttpMethodC.decode(error.config?.method?.toUpperCase()),
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
  }),
);
