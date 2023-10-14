import { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { DateFromISOString, date } from "io-ts-types";

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
  FileIdFromString,
  JobId,
  JobIdFromString,
  SheetIdFromString,
  VersionIdFromString,
  WorkbookIdFromString,
} from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

const JobTypeC = t.union([
  t.literal("file"),
  t.literal("sheet"),
  t.literal("space"),
  t.literal("workbook"),
]);

const JobOutcomeC = t.partial({
  acknowledge: t.boolean,
  buttonText: t.string,
  heading: t.string,
  message: t.string,
  next: t.union([
    t.intersection([
      t.type({
        type: t.literal("id"),
        id: t.string,
      }),
      t.partial({
        label: t.string,
      }),
    ]),
    t.intersection([
      t.type({
        type: t.literal("url"),
        url: t.string,
      }),
      t.partial({
        label: t.string,
      }),
    ]),
    t.intersection([
      t.type({
        type: t.literal("download"),
        url: t.string,
      }),
      t.partial({
        label: t.string,
        fileName: t.string,
      }),
    ]),
    t.type({
      type: t.literal("wait"),
    }),
  ]),
});

export const JobC = t.intersection([
  t.type({
    id: JobIdFromString,
    createdAt: DateFromISOString,
    operation: t.string,
    source: t.union([FileIdFromString, SheetIdFromString, WorkbookIdFromString]),
    type: JobTypeC,
    updatedAt: DateFromISOString,
  }),
  t.partial({
    config: t.union([
      t.intersection([
        t.type({
          sheet: SheetIdFromString,
        }),
        t.partial({
          exceptions: t.array(t.string),
          filter: t.union([
            t.literal("all"),
            t.literal("error"),
            t.literal("none"),
            t.literal("valid"),
          ]),
          filterField: t.string,
          q: t.string,
          searchField: t.string,
          searchValue: t.string,
        }),
      ]),
      t.intersection([
        t.type({
          driver: t.literal("csv"),
        }),
        t.partial({
          options: t.UnknownRecord,
        }),
      ]),
      t.type({
        sourceSheetId: SheetIdFromString,
        destinationSheetId: SheetIdFromString,
      }),
      t.type({
        options: t.partial({
          filter: t.union([
            t.literal("all"),
            t.literal("error"),
            t.literal("none"),
            t.literal("valid"),
          ]),
          filterField: t.string,
          ids: t.array(t.string),
          q: t.string,
          searchField: t.string,
          searchValue: t.string,
          sortDirection: t.union([t.literal("asc"), t.literal("desc")]),
          sortField: t.string,
          versionId: VersionIdFromString,
        }),
      }),
      t.intersection([
        t.type({
          fieldKey: t.string,
          find: t.string,
          replace: t.string,
        }),
        t.partial({
          filter: t.union([
            t.literal("all"),
            t.literal("error"),
            t.literal("none"),
            t.literal("valid"),
          ]),
          filterField: t.string,
          ids: t.array(t.string),
          q: t.string,
          searchField: t.string,
          searchValue: t.string,
        }),
      ]),
      t.type({
        destinationSheetId: SheetIdFromString,
        sourceSheetId: SheetIdFromString,
      }),
      t.UnknownRecord,
    ]),
    destination: WorkbookIdFromString,
    environmentId: EnvironmentIdFromString,
    estimatedCompletionAt: t.union([DateFromISOString, t.null]),
    finishedAt: t.union([DateFromISOString, t.null]),
    fileId: FileIdFromString,
    fromAction: t.intersection([
      t.type({
        label: t.string,
      }),
      t.partial({
        confirm: t.boolean,
        description: t.string,
        icon: t.string,
        inputForm: t.partial({}), // fix this
        mode: t.union([t.literal("background"), t.literal("foreground")]),
        operation: t.string,
        primary: t.boolean,
        requireAllValid: t.boolean,
        requireSelection: t.boolean,
        schedule: t.union([t.literal("daily"), t.literal("hourly"), t.literal("weekly")]),
        tooltip: t.string,
      }),
    ]),
    info: t.string,
    input: t.UnknownRecord,
    managed: t.boolean,
    mode: t.union([t.literal("background"), t.literal("foreground")]),
    outcome: JobOutcomeC,
    outcomeAcknowledgedAt: t.union([DateFromISOString, t.null]),
    progress: t.number,
    startedAt: t.union([DateFromISOString, t.null]),
    status: t.union([
      t.literal("canceled"),
      t.literal("complete"),
      t.literal("created"),
      t.literal("executing"),
      t.literal("failed"),
      t.literal("planning"),
      t.literal("ready"),
      t.literal("scheduled"),
    ]),
    subject: t.union([
      t.intersection([
        t.type({
          resource: t.string,
          type: t.union([t.literal("collection"), t.literal("resource")]),
        }),
        t.partial({
          params: t.UnknownRecord,
          query: t.UnknownRecord,
        }),
      ]),
      t.type({
        id: t.string,
        type: t.union([t.literal("collection"), t.literal("resource")]),
      }),
    ]),
    trigger: t.union([t.literal("immediate"), t.literal("manual")]),
  }),
]);

/*
 * Since Typescript doesn't have an Exact<T> type, we'll use the io-ts `t.exact`
 * to ensure our inputs don't break the API by passing extra data.
 */

const AcknowledgeJobInputC = t.exact(
  t.partial({
    estimatedCompletionAt: date,
    progress: t.number,
    reason: t.string,
  }),
);

const CancelJobInputC = t.exact(
  t.partial({
    reason: t.string,
  }),
);

const CompleteJobInputC = t.exact(
  t.partial({
    outcome: JobOutcomeC,
    reason: t.string,
  }),
);

const CreateJobInputC = t.exact(
  t.intersection([
    t.type({
      operation: t.string,
      source: t.union([FileIdFromString, SheetIdFromString, WorkbookIdFromString]),
      type: JobTypeC,
    }),
    t.partial({
      config: t.union([
        t.intersection([
          t.type({
            sheet: SheetIdFromString,
          }),
          t.partial({
            exceptions: t.array(t.string),
            filter: t.union([
              t.literal("all"),
              t.literal("error"),
              t.literal("none"),
              t.literal("valid"),
            ]),
            filterField: t.string,
            q: t.string,
            searchField: t.string,
            searchValue: t.string,
          }),
        ]),
        t.intersection([
          t.type({
            driver: t.literal("csv"),
          }),
          t.partial({
            options: t.UnknownRecord,
          }),
        ]),
        t.type({
          sourceSheetId: SheetIdFromString,
          destinationSheetId: SheetIdFromString,
        }),
        t.type({
          options: t.partial({
            filter: t.union([
              t.literal("all"),
              t.literal("error"),
              t.literal("none"),
              t.literal("valid"),
            ]),
            filterField: t.string,
            ids: t.array(t.string),
            q: t.string,
            searchField: t.string,
            searchValue: t.string,
            sortDirection: t.union([t.literal("asc"), t.literal("desc")]),
            sortField: t.string,
            versionId: VersionIdFromString,
          }),
        }),
        t.intersection([
          t.type({
            fieldKey: t.string,
            find: t.string,
            replace: t.string,
          }),
          t.partial({
            filter: t.union([
              t.literal("all"),
              t.literal("error"),
              t.literal("none"),
              t.literal("valid"),
            ]),
            filterField: t.string,
            ids: t.array(t.string),
            q: t.string,
            searchField: t.string,
            searchValue: t.string,
          }),
        ]),
        t.type({
          destinationSheetId: SheetIdFromString,
          sourceSheetId: SheetIdFromString,
        }),
        t.UnknownRecord,
      ]),
      destination: WorkbookIdFromString,
      environmentId: EnvironmentIdFromString,
      fileId: FileIdFromString,
      fromAction: t.intersection([
        t.type({
          label: t.string,
        }),
        t.partial({
          description: t.string,
          tooltip: t.string,
          schedule: t.union([t.literal("daily"), t.literal("hourly"), t.literal("weekly")]),
          operation: t.string,
          mode: t.union([t.literal("background"), t.literal("foreground")]),
          primary: t.boolean,
          confirm: t.boolean,
          requireAllValid: t.boolean,
          requireSelection: t.boolean,
          icon: t.string,
          inputForm: t.partial({}), // fix this
        }),
      ]),
      info: t.string,
      input: t.UnknownRecord,
      managed: t.boolean,
      mode: t.union([t.literal("background"), t.literal("foreground")]),
      outcome: JobOutcomeC,
      progress: t.number,
      status: t.union([
        t.literal("canceled"),
        t.literal("complete"),
        t.literal("created"),
        t.literal("executing"),
        t.literal("failed"),
        t.literal("planning"),
        t.literal("ready"),
        t.literal("scheduled"),
      ]),
      subject: t.union([
        t.intersection([
          t.type({
            resource: t.string,
            type: t.union([t.literal("collection"), t.literal("resource")]),
          }),
          t.partial({
            params: t.UnknownRecord,
            query: t.UnknownRecord,
          }),
        ]),
        t.type({
          id: t.string,
          type: t.union([t.literal("collection"), t.literal("resource")]),
        }),
      ]),
      trigger: t.union([t.literal("immediate"), t.literal("manual")]),
    }),
  ]),
);

const UpdateJobInputC = t.exact(
  t.partial({
    config: t.union([
      t.intersection([
        t.type({
          sheet: SheetIdFromString,
        }),
        t.partial({
          exceptions: t.array(t.string),
          filter: t.union([
            t.literal("all"),
            t.literal("error"),
            t.literal("none"),
            t.literal("valid"),
          ]),
          filterField: t.string,
          q: t.string,
          searchField: t.string,
          searchValue: t.string,
        }),
      ]),
      t.intersection([
        t.type({
          driver: t.literal("csv"),
        }),
        t.partial({
          options: t.UnknownRecord,
        }),
      ]),
      t.type({
        sourceSheetId: SheetIdFromString,
        destinationSheetId: SheetIdFromString,
      }),
      t.type({
        options: t.partial({
          filter: t.union([
            t.literal("all"),
            t.literal("error"),
            t.literal("none"),
            t.literal("valid"),
          ]),
          filterField: t.string,
          ids: t.array(t.string),
          q: t.string,
          searchField: t.string,
          searchValue: t.string,
          sortDirection: t.union([t.literal("asc"), t.literal("desc")]),
          sortField: t.string,
          versionId: VersionIdFromString,
        }),
      }),
      t.intersection([
        t.type({
          fieldKey: t.string,
          find: t.string,
          replace: t.string,
        }),
        t.partial({
          filter: t.union([
            t.literal("all"),
            t.literal("error"),
            t.literal("none"),
            t.literal("valid"),
          ]),
          filterField: t.string,
          ids: t.array(t.string),
          q: t.string,
          searchField: t.string,
          searchValue: t.string,
        }),
      ]),
      t.type({
        destinationSheetId: SheetIdFromString,
        sourceSheetId: SheetIdFromString,
      }),
      t.UnknownRecord,
    ]),
    outcomeAcknowledgedAt: date,
    progress: t.number,
    status: t.union([
      t.literal("canceled"),
      t.literal("complete"),
      t.literal("created"),
      t.literal("executing"),
      t.literal("failed"),
      t.literal("planning"),
      t.literal("ready"),
      t.literal("scheduled"),
    ]),
  }),
);

// ==================
//       Types
// ==================

export type Job = Readonly<t.TypeOf<typeof JobC>>;
export type Jobs = ReadonlyArray<Job>;

export type AcknowledgeJobInput = Readonly<t.TypeOf<typeof AcknowledgeJobInputC>>;
export type CancelJobInput = Readonly<t.TypeOf<typeof CancelJobInputC>>;
export type CompleteJobInput = Readonly<t.TypeOf<typeof CompleteJobInputC>>;
export type CreateJobInput = Readonly<t.TypeOf<typeof CreateJobInputC>>;
export type FailJobInput = t.TypeOf<typeof CompleteJobInputC>;
export type UpdateJobInput = Readonly<t.TypeOf<typeof UpdateJobInputC>>;

// ==================
//       Main
// ==================

/**
 * Acknowledge a `Job`.
 *
 * @since 0.1.0
 */
export function acknowledgeJob(
  jobId: JobId,
  input?: AcknowledgeJobInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Job>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/jobs/${jobId}/ack`, {
              info: input?.reason,
              progress: input?.progress,
              estimatedCompletionAt: input?.estimatedCompletionAt?.toISOString(),
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(JobC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Acknowledge a `Job`s outcome.
 *
 * @since 0.1.0
 */
export function acknowledgeJobOutcome(
  jobId: JobId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Job>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.post(`/jobs/${jobId}/outcome/ack`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(JobC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Cancel a `Job`.
 *
 * @since 0.1.0
 */
export function cancelJob(
  jobId: JobId,
  input?: CancelJobInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Job>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/jobs/${jobId}/cancel`, {
              info: input?.reason,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(JobC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Complete a `Job`.
 *
 * @since 0.1.0
 */
export function completeJob(
  jobId: JobId,
  input?: CompleteJobInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Job>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/jobs/${jobId}/complete`, {
              info: input?.reason,
              outcome: input?.outcome,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(JobC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Create a `Job`.
 *
 * @since 0.1.0
 */
export function createJob(
  input: CreateJobInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Job>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.post(`/jobs`, input),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(JobC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Delete a `Job`.
 *
 * @since 0.1.0
 */
export function deleteJob(
  jobId: JobId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.delete(`/jobs/${jobId}`, {
              params: {
                environmentId,
              },
            });
          },
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
 * Execute a `Job`.
 *
 * @since 0.1.0
 */
export function executeJob(
  jobId: JobId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.post(`/jobs/${jobId}/execute`),
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
 * Fail a `Job`.
 *
 * @since 0.1.0
 */
export function failJob(
  jobId: JobId,
  input?: FailJobInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Job>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/jobs/${jobId}/fail`, {
              info: input?.reason,
              outcome: input?.outcome,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(JobC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a `Job`.
 *
 * @since 0.1.0
 */
export function getJob(
  jobId: JobId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Job>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`/jobs/${jobId}`, {
              params: {
                environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(JobC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a list of `Job`s.
 *
 * @since 0.1.0
 */
export function listJobs(): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Jobs>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios, environmentId }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.get(`/jobs`, {
              params: {
                environmentId,
              },
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(JobC))),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Update a `Job`.
 *
 * @since 0.1.0
 */
export function updateJob(
  jobId: JobId,
  input: UpdateJobInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Job>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.patch(`/jobs/${jobId}`, input),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(JobC)),
    RTE.matchW(mkHttpError, identity),
  );
}
