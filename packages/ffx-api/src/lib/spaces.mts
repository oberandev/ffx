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

/*
 * Typescript doesn't offer an Exact<T> type, so we'll use `t.exact` & `t.strict`
 * to strip addtional properites. Sadly the compiler can't enfore this, so the input
 * must be separated into its constituent parts when contstructing the HTTP call
 * to ensure user inputs don't break the API by passing extra data.
 */

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

const ListSpacesQueryParamsC = t.exact(
  t.partial({
    archived: t.boolean,
    environmentId: EnvironmentIdFromString,
    isCollaborative: t.boolean,
    pageNumber: t.number,
    pageSize: t.number,
    search: t.string,
    sortDirection: t.union([t.literal("asc"), t.literal("desc")]),
    sortField: t.union([
      t.literal("createdAt"),
      t.literal("createdByUserName"),
      t.literal("environmentId"),
      t.literal("filesCount"),
      t.literal("name"),
      t.literal("workbooksCount"),
    ]),
  }),
);

// ==================
//       Types
// ==================

export type Space = Readonly<t.TypeOf<typeof SpaceC>>;
export type Spaces = ReadonlyArray<Space>;

export type CreateSpaceInput = Readonly<t.TypeOf<typeof CreateSpaceInputC>>;
export type ListSpacesQueryParams = Readonly<t.TypeOf<typeof ListSpacesQueryParamsC>>;
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
          () => {
            return axios.post(`/spaces`, {
              access: input.access,
              actions: input.actions,
              autoConfigure: input.autoConfigure,
              displayOrder: input.displayOrder,
              environmentId: input.environmentId,
              guestAuthentication: input.guestAuthentication,
              labels: input.labels,
              metadata: input.metadata,
              name: input.name,
              namespace: input.namespace,
              primaryWorkbookId: input.primaryWorkbookId,
              translationsPath: input.translationsPath,
            });
          },
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
export function listSpaces(
  queryParams?: ListSpacesQueryParams,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Spaces>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/spaces`, { params: queryParams }),
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
          () => {
            return axios.patch(`/spaces/${spaceId}`, {
              access: input.access,
              actions: input.actions,
              autoConfigure: input.autoConfigure,
              displayOrder: input.displayOrder,
              environmentId: input.environmentId,
              guestAuthentication: input.guestAuthentication,
              labels: input.labels,
              metadata: input.metadata,
              name: input.name,
              namespace: input.namespace,
              primaryWorkbookId: input.primaryWorkbookId,
              translationsPath: input.translationsPath,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(SpaceC)),
    RTE.matchW(mkHttpError, identity),
  );
}
