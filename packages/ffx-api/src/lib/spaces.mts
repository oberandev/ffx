import { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";

import { AuthLinkC } from "./environments.mjs";
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
  SpaceId,
  SpaceIdFromString,
  UserIdFromString,
  WorkbookIdFromString,
} from "./ids.mjs";
import { CustomActionC, PermissionC } from "./sheets.mjs";

// ==================
//   Runtime codecs
// ==================

export const SpaceC = t.intersection([
  t.type({
    id: SpaceIdFromString,
    createdAt: DateFromISOString,
    environmentId: EnvironmentIdFromString,
    guestAuthentication: t.array(AuthLinkC),
    name: t.string,
    updatedAt: DateFromISOString,
  }),
  t.partial({
    access: t.array(PermissionC),
    accessToken: t.string,
    actions: t.array(CustomActionC),
    archivedAt: DateFromISOString,
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
    size: t.type({
      id: t.string,
      name: t.string,
      numFiles: t.number,
      numUsers: t.number,
      pdv: t.number,
    }),
    translationsPath: t.string,
    upgradedAt: DateFromISOString,
    workbooksCount: t.number,
  }),
]);

const CreateSpaceInputC = t.exact(
  t.partial({
    access: t.array(PermissionC),
    actions: t.array(CustomActionC),
    autoConfigure: t.boolean,
    displayOrder: t.number,
    environmentId: EnvironmentIdFromString,
    guestAuthentication: t.array(AuthLinkC),
    labels: t.array(t.string),
    metadata: t.UnknownRecord,
    name: t.string,
    namespace: t.string,
    primaryWorkbookId: WorkbookIdFromString,
    translationsPath: t.string,
  }),
);

// ==================
//       Types
// ==================

export type Space = Readonly<t.TypeOf<typeof SpaceC>>;
export type Spaces = ReadonlyArray<Space>;

export type CreateSpaceInput = Readonly<t.TypeOf<typeof CreateSpaceInputC>>;
export type UpdateSpaceInput = CreateSpaceInput;

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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.post(`/spaces/${spaceId}/archive`),
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
 * Create a `Space`.
 *
 * @since 0.1.0
 */
export function createSpace(
  input: CreateSpaceInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Space>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.post(`/spaces`, input),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(SpaceC)),
    RTE.matchW(mkHttpError, identity),
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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.delete(`/spaces/${spaceId}`),
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
 * Get a `Space`.
 *
 * @since 0.1.0
 */
export function getSpace(
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Space>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/spaces/${spaceId}`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(SpaceC)),
    RTE.matchW(mkHttpError, identity),
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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/spaces`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(SpaceC))),
    RTE.matchW(mkHttpError, identity),
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
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.patch(`/spaces/${spaceId}`, input),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(SpaceC)),
    RTE.matchW(mkHttpError, identity),
  );
}
