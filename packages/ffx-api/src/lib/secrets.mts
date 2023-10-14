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

const CreateSecretInputC = t.exact(
  t.intersection([
    t.type({
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

export type CreateSecretInput = Readonly<t.TypeOf<typeof CreateSecretInputC>>;

// ==================
//       Main
// ==================

/**
 * Create a `Secret`.
 *
 * @since 0.1.0
 */
export function createSecret(
  input: CreateSecretInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Secret>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () =>
            axios.post(`/secrets`, {
              ...input,
              environmentId,
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
  spaceId?: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Secrets>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
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
