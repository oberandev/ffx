import axios, { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as Str from "fp-ts/string";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { Iso } from "monocle-ts";
import { Newtype, iso } from "newtype-ts";

import { SheetId } from "./sheets.mjs";
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

export interface VersionId extends Newtype<{ readonly VersionId: unique symbol }, string> {}

export const isoVersionId: Iso<VersionId, string> = iso<VersionId>();

export const VersionIdC = new t.Type<VersionId>(
  "VersionIdFromString",
  (input: unknown): input is VersionId => {
    return Str.isString(input) && /^us_vr_\w{8}$/g.test(input);
  },
  (input, context) => {
    return Str.isString(input) && /^us_vr_\w{8}$/g.test(input)
      ? t.success(isoVersionId.wrap(input))
      : t.failure(input, context);
  },
  t.identity,
);

export const VersionC = t.type({
  versionId: VersionIdC,
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
