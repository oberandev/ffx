import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";

import { SheetId, VersionId, VersionIdFromString } from "./ids.mjs";
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

export const VersionC = t.type({
  versionId: VersionIdFromString,
});

// ==================
//       Types
// ==================

export type Version = Readonly<t.TypeOf<typeof VersionC>>;

// ==================
//       Main
// ==================

/**
 * Create a `Version`.
 *
 * @since 0.1.0
 */
export function createVersion(
  sheetId: SheetId,
  parentVersionId: VersionId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Version>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain((r) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(
              `${r.baseUrl}/versions`,
              { sheetId, parentVersionId },
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
    RTE.chain(decodeWith(VersionC)),
    RTE.matchW((axiosError) => mkHttpError(axiosError), identity),
  );
}
