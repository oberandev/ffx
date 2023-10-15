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
import {
  EnvironmentId,
  EnvironmentIdFromString,
  SecretId,
  SecretIdFromString,
  SpaceId,
  SpaceIdFromString,
} from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

export const SecretC = t.intersection([
  t.type({
    id: SecretIdFromString,
    environmentId: EnvironmentIdFromString,
    name: t.string,
    value: t.string,
  }),
  t.partial({
    spaceId: SpaceIdFromString,
  }),
]);

/*
 * Typescript doesn't offer an Exact<T> type, so we'll use `t.exact` & `t.strict`
 * to strip addtional properites. Sadly the compiler can't enfore this, so the input
 * must be separated into its constituent parts when contstructing the HTTP call
 * to ensure user inputs don't break the API by passing extra data.
 */

const UpsertSecretInputC = t.exact(
  t.intersection([
    t.type({
      environmentId: EnvironmentIdFromString,
      name: t.string,
      value: t.string,
    }),
    t.partial({
      spaceId: SpaceIdFromString,
    }),
  ]),
);

// ==================
//       Types
// ==================

export type Secret = Readonly<t.TypeOf<typeof SecretC>>;
export type Secrets = ReadonlyArray<Secret>;

export type UpsertSecretInput = Readonly<t.TypeOf<typeof UpsertSecretInputC>>;

// ==================
//       Main
// ==================

/**
 * Delete a `Secret`.
 *
 * @since 0.1.0
 */
export function deleteSecret(
  secretId: SecretId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.delete(`/secrets/${secretId}`),
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
 * Get a list of `Secret`s.
 *
 * @since 0.1.0
 */
export function listSecrets(
  environmentId: EnvironmentId,
  spaceId?: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Secrets>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`/secrets`, {
              params: {
                environmentId,
                spaceId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(SecretC))),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Create or update a `Secret`.
 *
 * @since 0.1.0
 */
export function upsertSecret(
  input: UpsertSecretInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Secret>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () =>
            axios.post(`/secrets`, {
              environmentId: input.environmentId,
              name: input.name,
              spaceId: input.spaceId,
              value: input.value,
            }),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(SecretC)),
    RTE.matchW(mkHttpError, identity),
  );
}
