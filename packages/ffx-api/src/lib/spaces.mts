import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import { AuthLinkC } from "./environments.mjs";
import {
  EnvironmentIdFromString,
  SpaceId,
  SpaceIdFromString,
  UserIdFromString,
  WorkbookIdFromString,
} from "./ids.mjs";
import { CustomActionC, PermissionC } from "./sheets.mjs";
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

export const SpaceC = t.intersection(
  [
    t.type({
      id: SpaceIdFromString,
      createdAt: t.string,
      environmentId: EnvironmentIdFromString,
      guestAuthentication: t.array(AuthLinkC),
      name: t.string,
      updatedAt: t.string,
    }),
    t.partial({
      access: t.array(PermissionC),
      accessToken: t.string,
      actions: t.array(CustomActionC),
      archivedAt: t.string,
      autoConfigure: t.boolean,
      createdByUserId: UserIdFromString,
      displayOrder: t.number,
      filesCount: t.number,
      guestLink: t.array(t.string),
      isCollaborative: t.boolean,
      labels: t.array(t.string),
      metadata: t.UnknownRecord,
      namespace: t.string,
      primaryWorkbookId: WorkbookIdFromString,
      size: t.type(
        {
          id: t.string,
          name: t.string,
          numFiles: t.number,
          numUsers: t.number,
          pdv: t.number,
        },
        "SpaceSizeC",
      ),
      translationsPath: t.string,
      upgradedAt: t.string,
      workbooksCount: t.number,
    }),
  ],
  "SpaceC",
);

// ==================
//       Types
// ==================

export type Space = Readonly<t.TypeOf<typeof SpaceC>>;
export type Spaces = ReadonlyArray<Space>;
export type CreateSpaceInput = Partial<Omit<Space, "id">>;
export type UpdateSpaceInput = Partial<Omit<Space, "id">>;

// ==================
//       Main
// ==================

/**
 * Archive a `Space`.
 *
 * @since 0.1.0
 */
export function archiveSpace(
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`${r.baseUrl}/spaces/${spaceId}/archive`, {
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
 * Create a `Space`.
 *
 * @since 0.1.0
 */
export function createSpace(
  input: CreateSpaceInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Space>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`${r.baseUrl}/spaces`, input, {
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
    RTE.chain(decodeWith(SpaceC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Delete a `Space`.
 *
 * @since 0.1.0
 */
export function deleteSpace(
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/spaces/${spaceId}`, {
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
 * Get a `Space`.
 *
 * @since 0.1.0
 */
export function getSpace(
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Space>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/spaces/${spaceId}`, {
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
    RTE.chain(decodeWith(SpaceC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get a list of `Space`s.
 *
 * @since 0.1.0
 */
export function listSpaces(): RT.ReaderTask<
  ApiReader,
  DecoderErrors | HttpError | Successful<Spaces>
> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/spaces`, {
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
    RTE.chain(decodeWith(t.array(SpaceC))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Update a `Space`.
 *
 * @since 0.1.0
 */
export function updateSpace(
  spaceId: SpaceId,
  input: UpdateSpaceInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Space>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`${r.baseUrl}/spaces/${spaceId}`, input, {
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
    RTE.chain(decodeWith(SpaceC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
