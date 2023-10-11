import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as Str from "fp-ts/string";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { Iso } from "monocle-ts";
import { Newtype, iso } from "newtype-ts";

import { EnvironmentIdFromString } from "./environments.mjs";
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

export interface DocumentId extends Newtype<{ readonly DocumentId: unique symbol }, string> {}

export const isoDocumentId: Iso<DocumentId, string> = iso<DocumentId>();

export const DocumentIdFromString = new t.Type<DocumentId>(
  "DocumentIdFromString",
  (input: unknown): input is DocumentId => {
    return Str.isString(input) && /^us_dc_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_dc_\w{8}$/g.test(input)
      ? t.success(isoDocumentId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export interface SpaceId extends Newtype<{ readonly SpaceId: unique symbol }, string> {}

export const isoSpaceId: Iso<SpaceId, string> = iso<SpaceId>();

export const SpaceIdFromString = new t.Type<SpaceId>(
  "SpaceIdFromString",
  (input: unknown): input is SpaceId => {
    return Str.isString(input) && /^us_sp_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_sp_\w{8}$/g.test(input)
      ? t.success(isoSpaceId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export const DocumentC = t.intersection(
  [
    t.type({
      id: DocumentIdFromString,
      body: t.string,
      environmentId: EnvironmentIdFromString,
      spaceId: SpaceIdFromString,
      title: t.string,
    }),
    t.partial({
      treatments: t.array(t.string),
    }),
  ],
  "DocumentC",
);

// ==================
//       Types
// ==================

export type Document = Readonly<t.TypeOf<typeof DocumentC>>;
export type Documents = ReadonlyArray<Document>;
export type CreateDocumentInput = Pick<Document, "body" | "title" | "treatments">;
export type UpdateDocumentInput = Pick<Document, "body" | "title" | "treatments">;

// ==================
//       Main
// ==================

/**
 * Create a `Document`.
 *
 * @since 0.1.0
 */
export function createDocument(
  spaceId: SpaceId,
  input: CreateDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`${r.baseUrl}/spaces/${spaceId}/documents`, input, {
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
    RTE.chain(decodeWith(DocumentC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Delete a `Document`.
 *
 * @since 0.1.0
 */
export function deleteDocument(
  documentId: DocumentId,
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/spaces/${spaceId}/documents/${documentId}`, {
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
 * Get a `Document`.
 *
 * @since 0.1.0
 */
export function getDocument(
  documentId: DocumentId,
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/spaces/${spaceId}/documents/${documentId}`, {
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
    RTE.chain(decodeWith(DocumentC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get a list of `Document`s.
 *
 * @since 0.1.0
 */
export function listDocuments(
  spaceId: SpaceId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Documents>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/spaces/${spaceId}/documents`, {
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
    RTE.chain(decodeWith(t.array(DocumentC))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Update a `Document`.
 *
 * @since 0.1.0
 */
export function updateDocument(
  documentId: DocumentId,
  spaceId: SpaceId,
  input: UpdateDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(`${r.baseUrl}/spaces/${spaceId}/documents/${documentId}`, input, {
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
    RTE.chain(decodeWith(DocumentC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
