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

export const AuthLinkC = t.union([t.literal("shared_link"), t.literal("magic_link")]);

export interface EnvironmentId extends Newtype<{ readonly EnvironmentId: unique symbol }, string> {}

export const isoEnvironmentId: Iso<EnvironmentId, string> = iso<EnvironmentId>();

export const EnvironmentIdFromString = new t.Type<EnvironmentId>(
  "EnvironmentIdFromString",
  (input: unknown): input is EnvironmentId => {
    return Str.isString(input) && /^us_env_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_env_\w{8}$/g.test(input)
      ? t.success(isoEnvironmentId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface AccountId extends Newtype<{ readonly AccountId: unique symbol }, string> {}

export const isoAccountId: Iso<AccountId, string> = iso<AccountId>();

export const AccountIdFromString = new t.Type<AccountId>(
  "AccountIdFromString",
  (input: unknown): input is AccountId => {
    return Str.isString(input) && /^us_acc_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_acc_\w{8}$/g.test(input)
      ? t.success(isoAccountId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export const EnvironmentC = t.intersection(
  [
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
  ],
  "EnvironmentC",
);

// ==================
//       Types
// ==================

export type Environment = Readonly<t.TypeOf<typeof EnvironmentC>>;
export type Environments = ReadonlyArray<Environment>;
export type CreateEnvironmentInput = Omit<Environment, "accountId" | "id">;
export type UpdateEnvironmentInput = Partial<Omit<Environment, "accountId" | "features" | "id">>;

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
