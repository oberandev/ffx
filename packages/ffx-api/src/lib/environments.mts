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
import { AccountIdFromString, EnvironmentId, EnvironmentIdFromString } from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

export const AuthLinkC = t.union([t.literal("shared_link"), t.literal("magic_link")]);

export const EnvironmentC = t.intersection([
  t.type({
    id: EnvironmentIdFromString,
    accountId: AccountIdFromString,
    features: t.UnknownRecord,
    guestAuthentication: t.array(AuthLinkC),
    isProd: t.boolean,
    metadata: t.UnknownRecord,
    name: t.string,
  }),
  t.partial({
    namespaces: t.array(t.string),
    translationsPath: t.string,
  }),
]);

/*
 * Typescript doesn't offer an Exact<T> type, so we'll use `t.exact` & `t.strict`
 * to strip addtional properites. Sadly the compiler can't enfore this, so the input
 * must be separated into its constituent parts when contstructing the HTTP call
 * to ensure user inputs don't break the API by passing extra data.
 */

const CreateEnvironmentInputC = t.exact(
  t.intersection([
    t.type({
      isProd: t.boolean,
      name: t.string,
    }),
    t.partial({
      guestAuthentication: t.array(AuthLinkC),
      metadata: t.UnknownRecord,
      namespaces: t.array(t.string),
      translationsPath: t.string,
    }),
  ]),
);

const ListEnvironmentsQueryParamsC = t.exact(
  t.partial({
    pageNumber: t.number,
    pageSize: t.number,
  }),
);

// ==================
//       Types
// ==================

export type Environment = Readonly<t.TypeOf<typeof EnvironmentC>>;
export type Environments = ReadonlyArray<Environment>;

export type CreateEnvironmentInput = Readonly<t.TypeOf<typeof CreateEnvironmentInputC>>;
export type UpdateEnvironmentInput = Partial<CreateEnvironmentInput>;
export type ListEnvironmentsQueryParams = Readonly<t.TypeOf<typeof ListEnvironmentsQueryParamsC>>;

// ==================
//       Main
// ==================

/**
 * Create an `Environment`.
 *
 * @since 0.1.0
 */
export function createEnvironment(
  input: CreateEnvironmentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Environment>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/environments`, {
              guestAuthentication: input.guestAuthentication,
              isProd: input.isProd,
              metadata: input.metadata,
              name: input.name,
              namespaces: input.namespaces,
              translationsPath: input.translationsPath,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(EnvironmentC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Delete an `Environment`.
 *
 * @since 0.1.0
 */
export function deleteEnvironment(
  environmentId: EnvironmentId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.delete(`/environments/${environmentId}`),
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
 * Get an `Environment`.
 *
 * @since 0.1.0
 */
export function getEnvironment(
  environmentId: EnvironmentId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Environment>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/environments/${environmentId}`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(EnvironmentC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a list of `Environment`s.
 *
 * @since 0.1.0
 */
export function listEnvironments(
  queryParams?: ListEnvironmentsQueryParams,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Environments>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/environments`, { params: queryParams }),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(EnvironmentC))),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Update an `Environment`.
 *
 * @since 0.1.0
 */
export function updateEnvironment(
  environmentId: EnvironmentId,
  input: UpdateEnvironmentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Environment>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`/environments/${environmentId}`, {
              guestAuthentication: input.guestAuthentication,
              isProd: input.isProd,
              metadata: input.metadata,
              name: input.name,
              namespaces: input.namespaces,
              translationsPath: input.translationsPath,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(EnvironmentC)),
    RTE.matchW(mkHttpError, identity),
  );
}
