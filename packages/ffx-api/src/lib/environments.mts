import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import { AccountIdFromString, EnvironmentId, EnvironmentIdFromString } from "./ids.mjs";
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

// ==================
//       Types
// ==================

export type Environment = Readonly<t.TypeOf<typeof EnvironmentC>>;
export type Environments = ReadonlyArray<Environment>;
export type CreateEnvironmentInput = Readonly<t.TypeOf<typeof CreateEnvironmentInputC>>;
export type UpdateEnvironmentInput = Partial<CreateEnvironmentInput>;

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
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`${r.baseUrl}/environments`, input, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(EnvironmentC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
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
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/environments/${environmentId}`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
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
 * Get an `Environment`.
 *
 * @since 0.1.0
 */
export function getEnvironment(
  environmentId: EnvironmentId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Environment>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/environments/${environmentId}`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(EnvironmentC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get a list of `Environment`s.
 *
 * @since 0.1.0
 */
export function listEnvironments(): RT.ReaderTask<
  ApiReader,
  DecoderErrors | HttpError | Successful<Environments>
> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/environments`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(EnvironmentC))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
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
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`${r.baseUrl}/environments/${environmentId}`, input, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(EnvironmentC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
