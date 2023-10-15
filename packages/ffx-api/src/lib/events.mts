import { AxiosError } from "axios";
import { identity, pipe } from "fp-ts/function";
import * as RT from "fp-ts/ReaderTask";
import * as RTE from "fp-ts/ReaderTaskEither";
import * as TE from "fp-ts/TaskEither";
import * as t from "io-ts";
import { DateFromISOString } from "io-ts-types";

import {
  ApiReader,
  DecoderErrors,
  HttpError,
  Successful,
  decodeWith,
  mkHttpError,
} from "./http.mjs";
import {
  AccountIdFromString,
  AgentIdFromString,
  DocumentIdFromString,
  EnvironmentIdFromString,
  EventId,
  EventIdFromString,
  FileIdFromString,
  GuestIdFromString,
  JobIdFromString,
  SheetIdFromString,
  SnapshotIdFromString,
  SpaceIdFromString,
  UserIdFromString,
  VersionIdFromString,
  WorkbookIdFromString,
} from "./ids.mjs";

// ==================
//   Runtime codecs
// ==================

const EventDomainC = t.union([
  t.literal("document"),
  t.literal("file"),
  t.literal("job"),
  t.literal("sheet"),
  t.literal("space"),
  t.literal("workbook"),
]);

export const EventTopicC = t.union([
  t.literal("agent:created"),
  t.literal("agent:deleted"),
  t.literal("agent:updated"),
  t.literal("commit:completed"),
  t.literal("commit:created"),
  t.literal("commit:updated"),
  t.literal("document:created"),
  t.literal("document:deleted"),
  t.literal("document:updated"),
  t.literal("file:created"),
  t.literal("file:deleted"),
  t.literal("file:updated"),
  t.literal("job:completed"),
  t.literal("job:created"),
  t.literal("job:deleted"),
  t.literal("job:failed"),
  t.literal("job:outcome-acknowledged"),
  t.literal("job:ready"),
  t.literal("job:scheduled"),
  t.literal("job:updated"),
  t.literal("layer:created"),
  t.literal("records:created"),
  t.literal("records:deleted"),
  t.literal("records:updated"),
  t.literal("sheet:created"),
  t.literal("sheet:deleted"),
  t.literal("sheet:updated"),
  t.literal("snapshot:created"),
  t.literal("space:created"),
  t.literal("space:deleted"),
  t.literal("space:updated"),
  t.literal("workbook:created"),
  t.literal("workbook:deleted"),
  t.literal("workbook:updated"),
]);

const EventContextC = t.intersection([
  t.type({
    accountId: AccountIdFromString,
    environmentId: EnvironmentIdFromString,
  }),
  t.partial({
    actionName: t.string,
    actorId: t.union([AgentIdFromString, GuestIdFromString, UserIdFromString]),
    documentId: DocumentIdFromString,
    fileId: FileIdFromString,
    jobId: JobIdFromString,
    namespaces: t.array(t.string),
    precedingEventId: EventIdFromString,
    sheetId: SheetIdFromString,
    sheetSlug: t.string,
    slugs: t.partial({
      sheet: t.string,
      space: t.string,
      workbook: t.string,
    }),
    snapshotId: SnapshotIdFromString,
    spaceId: SpaceIdFromString,
    versionId: VersionIdFromString,
    workbookId: WorkbookIdFromString,
  }),
]);

export const EventC = t.intersection([
  t.type({
    id: EventIdFromString,
    context: EventContextC,
    createdAt: DateFromISOString,
    domain: EventDomainC,
    namespaces: t.array(t.string),
    topic: EventTopicC,
  }),
  t.partial({
    acknowledgedAt: t.union([DateFromISOString, t.null]),
    acknowledgedBy: UserIdFromString,
    attributes: t.partial({
      progress: t.partial({
        current: t.number,
        percent: t.number,
        total: t.number,
      }),
      targetUpdatedAt: DateFromISOString,
    }),
    callbackUrl: t.string,
    dataUrl: t.string,
    deletedAt: DateFromISOString,
    origin: t.partial({
      id: t.string,
      slug: t.string,
    }),
    payload: t.UnknownRecord,
  }),
]);

/*
 * Typescript doesn't offer an Exact<T> type, so we'll use `t.exact` & `t.strict`
 * to strip addtional properites. Sadly the compiler can't enfore this, so the input
 * must be separated into its constituent parts when contstructing the HTTP call
 * to ensure user inputs don't break the API by passing extra data.
 */

const CreateEventInputC = t.exact(
  t.intersection([
    t.type({
      context: EventContextC,
      domain: EventDomainC,
      payload: t.UnknownRecord,
      topic: EventTopicC,
    }),
    t.partial({
      attributes: t.partial({
        progress: t.partial({
          current: t.number,
          percent: t.number,
          total: t.number,
        }),
        targetUpdatedAt: DateFromISOString,
      }),
      callbackUrl: t.string,
      dataUrl: t.string,
      origin: t.partial({
        id: t.string,
        slug: t.string,
      }),
    }),
  ]),
);

const ListEventsQueryParamsC = t.exact(
  t.partial({
    domain: EventDomainC,
    environmentId: EnvironmentIdFromString,
    includeAcknowledged: t.boolean,
    pageNumber: t.number,
    pageSize: t.number,
    since: DateFromISOString,
    spaceId: SpaceIdFromString,
    topic: EventTopicC,
  }),
);

// ==================
//       Types
// ==================

export type Event = Readonly<t.TypeOf<typeof EventC>>;
export type Events = ReadonlyArray<Event>;
export type EventTopic = Readonly<t.TypeOf<typeof EventTopicC>>;

export type CreateEventInput = Readonly<t.TypeOf<typeof CreateEventInputC>>;
export type ListEventsQueryParams = Readonly<t.TypeOf<typeof ListEventsQueryParamsC>>;

// ==================
//       Main
// ==================

/**
 * Acknowledge an `Event`.
 *
 * @since 0.1.0
 */
export function acknowledgeEvent(
  eventId: EventId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<{ success: boolean }>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/events/${eventId}`);
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
 * Create an `Event`.
 *
 * @since 0.1.0
 */
export function createEvent(
  input: CreateEventInput,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Event>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => {
            return axios.post(`/events`, {
              attributes: input.attributes,
              callbackUrl: input.callbackUrl,
              context: input.context,
              dataUrl: input.dataUrl,
              domain: input.domain,
              origin: input.origin,
              payload: input.payload,
              topic: input.topic,
            });
          },
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(EventC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get an `Event`.
 *
 * @since 0.1.0
 */
export function getEvent(
  eventId: EventId,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Event>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/events/${eventId}`),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(EventC)),
    RTE.matchW(mkHttpError, identity),
  );
}

/**
 * Get a list of `Event`s.
 *
 * @since 0.1.0
 */
export function listEvents(
  queryParams?: ListEventsQueryParams,
): RT.ReaderTask<ApiReader, DecoderErrors | HttpError | Successful<Events>> {
  return pipe(
    RTE.ask<ApiReader>(),
    RTE.chain(({ axios }) => {
      return RTE.fromTaskEither(
        TE.tryCatch(
          () => axios.get(`/events`, { params: queryParams }),
          (reason: unknown) => reason as AxiosError,
        ),
      );
    }),
    RTE.map((resp) => resp.data.data),
    RTE.chain(decodeWith(t.array(EventC))),
    RTE.matchW(mkHttpError, identity),
  );
}
