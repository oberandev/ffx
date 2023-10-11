import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import { EnvironmentIdCodec } from "./environments.mjs";
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

export const DocumentIdCodec = new t.Type<string, string, unknown>(
  "DocumentId",
  (input: unknown): input is string => {
    return typeof input === "string" && /^us_dc_\w{8}$/g.test(input);
  },
  (input, context) => {
    return typeof input === "string" && /^us_dc_\w{8}$/g.test(input)
      ? t.success(input)
      : t.failure(input, context);
  },
  t.identity,
);

export const SpaceIdCodec = new t.Type<string, string, unknown>(
  "SpaceId",
  (input: unknown): input is string => {
    return typeof input === "string" && /^us_sp_\w{8}$/g.test(input);
  },
  (input, context) => {
    return typeof input === "string" && /^us_sp_\w{8}$/g.test(input)
      ? t.success(input)
      : t.failure(input, context);
  },
  t.identity,
);

export const DocumentCodec = t.strict({
  id: DocumentIdCodec,
  body: t.string,
  environmentId: EnvironmentIdCodec,
  spaceId: SpaceIdCodec,
  title: t.string,
});

// ==================
//       Types
// ==================

export type Document = Readonly<t.TypeOf<typeof DocumentCodec>>;
export type DocumentId = t.TypeOf<typeof DocumentIdCodec>;
export type Documents = ReadonlyArray<Document>;
export type SpaceId = t.TypeOf<typeof SpaceIdCodec>;
export type CreateDocumentInput = Pick<Document, "body" | "spaceId" | "title">;
export type DeleteDocumentInput = Pick<Document, "id" | "spaceId">;
export type GetDocumentInput = Pick<Document, "id" | "spaceId">;
export type UpdateDocumentInput = Omit<Document, "environmentId">;

/**
 * Create a `Document`.
 *
 * @since 0.1.0
 */
export function createDocument(
  input: CreateDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(
              `${r.baseUrl}/spaces/${input.spaceId}/documents`,
              { body: input.body, title: input.title },
              {
                headers: {
                  "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
                },
              },
            );
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(DocumentCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Delete a `Document`.
 *
 * @since 0.1.0
 */
export function deleteDocument(
  input: DeleteDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`${r.baseUrl}/spaces/${input.spaceId}/documents/${input.id}`, {
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
    RTE.chain(decodeWith(t.strict({ success: t.boolean }))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Get a `Document`.
 *
 * @since 0.1.0
 */
export function getDocument(
  input: GetDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`${r.baseUrl}/spaces/${input.spaceId}/documents/${input.id}`, {
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
    RTE.chain(decodeWith(DocumentCodec)),
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
    RTE.chain(decodeWith(t.array(DocumentCodec))),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}

/**
 * Update a `Document`.
 *
 * @since 0.1.0
 */
export function updateDocument(
  input: UpdateDocumentInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Document>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.patch(
              `${r.baseUrl}/spaces/${input.spaceId}/documents/${input.id}`,
              { body: input.body, title: input.title },
              {
                headers: {
                  "User-Agent": `${r.pkgJson.name}/v${r.pkgJson.version}`,
                },
              },
            );
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(DocumentCodec)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
