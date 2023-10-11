import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as Str from "fp-ts/string";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { Iso } from "monocle-ts";
import { Newtype, iso } from "newtype-ts";

import { SpaceId, codecSpaceId } from "./documents.mjs";
import { EnvironmentId, codecEnvironmentId } from "./environments.mjs";
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

export interface SecretId extends Newtype<{ readonly SecretId: unique symbol }, string> {}

export const isoSecretId: Iso<SecretId, string> = iso<SecretId>();

export const codecSecretId = new t.Type<SecretId>(
  "SecretIdFromString",
  (input: unknown): input is SecretId => {
    return Str.isString(input) && /^us_sec_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_sec_\w{8}$/g.test(input)
      ? t.success(isoSecretId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export const codecSecret = t.intersection([
  t.type({
    id: codecSecretId,
    environmentId: codecEnvironmentId,
    name: t.string,
    value: t.string,
  }),
  t.partial({
    spaceId: codecSpaceId,
  }),
]);

// ==================
//       Types
// ==================

export type Secret = Readonly<t.TypeOf<typeof codecSecret>>;
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
    RTE.chain(decodeWith(codecSecret)),
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
    RTE.chain(decodeWith(t.array(codecSecret))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
