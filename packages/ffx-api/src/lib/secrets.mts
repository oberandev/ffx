import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import {
  EnvironmentId,
  EnvironmentIdFromString,
  SecretId,
  SecretIdFromString,
  SpaceId,
  SpaceIdFromString,
} from "./ids.mjs";
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

export const SecretC = t.intersection(
  [
    t.type({
      id: SecretIdFromString,
      environmentId: EnvironmentIdFromString,
      name: t.string,
      value: t.string,
    }),
    t.partial({
      spaceId: SpaceIdFromString,
    }),
  ],
  "SecretC",
);

// ==================
//       Types
// ==================

export type Secret = Readonly<t.TypeOf<typeof SecretC>>;
export type Secrets = ReadonlyArray<Secret>;
export type CreateSecretInput = Omit<Secret, "id">;

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
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`${r.baseUrl}/secrets`, input, {
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
    RTE.chain(decodeWith(SecretC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
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
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/secrets/${secretId}`, {
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
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/secrets`, {
              headers: {
                "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
              },
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
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
