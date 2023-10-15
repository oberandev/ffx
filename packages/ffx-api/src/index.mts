import mkLogger from "@ffx/logger";
import axios from "axios";
import { constVoid } from "fp-ts/function";
import { ReadStream } from "node:fs";
import { match } from "ts-pattern";

import {
  Agent,
  Agents,
  CreateAgentInput,
  createAgent,
  deleteAgent,
  getAgent,
  listAgents,
} from "./lib/agents.mjs";
import {
  CreateDocumentInput,
  Document,
  Documents,
  UpdateDocumentInput,
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from "./lib/documents.mjs";
import {
  CreateEnvironmentInput,
  Environment,
  Environments,
  UpdateEnvironmentInput,
  createEnvironment,
  deleteEnvironment,
  getEnvironment,
  listEnvironments,
  updateEnvironment,
} from "./lib/environments.mjs";
import {
  CreateEventInput,
  Event,
  Events,
  ListEventsQueryParams,
  acknowledgeEvent,
  createEvent,
  getEvent,
  listEvents,
} from "./lib/events.mjs";
import {
  File_,
  FileContents,
  Files,
  ListFilesQueryParams,
  UpdateFileInput,
  UploadFileInput,
  deleteFile,
  downloadFile,
  getFile,
  listFiles,
  updateFile,
  uploadFile,
} from "./lib/files.mjs";
import { ApiReader, DecoderErrors, HttpError, Successful } from "./lib/http.mjs";
import {
  AgentId,
  DocumentId,
  EnvironmentId,
  EventId,
  FileId,
  JobId,
  RecordId,
  SecretId,
  SheetId,
  SpaceId,
  VersionId,
  WorkbookId,
} from "./lib/ids.mjs";
import {
  AcknowledgeJobInput,
  CancelJobInput,
  CompleteJobInput,
  CreateJobInput,
  FailJobInput,
  Job,
  Jobs,
  UpdateJobInput,
  acknowledgeJob,
  acknowledgeJobOutcome,
  cancelJob,
  completeJob,
  createJob,
  deleteJob,
  executeJob,
  failJob,
  getJob,
  listJobs,
  updateJob,
} from "./lib/jobs.mjs";
import {
  ListRecordsQueryParams,
  Records,
  RecordWithLinks,
  UpdateRecordsQueryParams,
  deleteRecords,
  insertRecords,
  listRecords,
  updateRecords,
} from "./lib/records.mjs";
import {
  Secret,
  Secrets,
  UpsertSecretInput,
  deleteSecret,
  listSecrets,
  upsertSecret,
} from "./lib/secrets.mjs";
import { Sheet, Sheets, deleteSheet, getSheet, listSheets } from "./lib/sheets.mjs";
import {
  CreateSpaceInput,
  Space,
  Spaces,
  UpdateSpaceInput,
  archiveSpace,
  createSpace,
  deleteSpace,
  getSpace,
  listSpaces,
  updateSpace,
} from "./lib/spaces.mjs";
import { Version, createVersion } from "./lib/versions.mjs";
import {
  CreateWorkbookInput,
  UpdateWorkbookInput,
  Workbook,
  Workbooks,
  createWorkbook,
  deleteWorkbook,
  getWorkbook,
  listWorkbooks,
  updateWorkbook,
} from "./lib/workbooks.mjs";
import pkgJson from "../package.json"; // eslint-disable-line import/no-relative-parent-imports

interface ApiClient {
  agents: {
    create: (input: CreateAgentInput) => Promise<DecoderErrors | HttpError | Successful<Agent>>;
    delete: (
      agentId: AgentId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (agentId: AgentId) => Promise<DecoderErrors | HttpError | Successful<Agent>>;
    list: () => Promise<DecoderErrors | HttpError | Successful<Agents>>;
  };
  documents: {
    create: (
      spaceId: SpaceId,
      input: CreateDocumentInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Document>>;
    delete: (
      documentId: DocumentId,
      spaceId: SpaceId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (
      documentId: DocumentId,
      spaceId: SpaceId,
    ) => Promise<DecoderErrors | HttpError | Successful<Document>>;
    list: (spaceId: SpaceId) => Promise<DecoderErrors | HttpError | Successful<Documents>>;
    update: (
      documentId: DocumentId,
      spaceId: SpaceId,
      input: UpdateDocumentInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Document>>;
  };
  environments: {
    create: (
      input: CreateEnvironmentInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Environment>>;
    delete: (
      environmentId: EnvironmentId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (
      environmentId: EnvironmentId,
    ) => Promise<DecoderErrors | HttpError | Successful<Environment>>;
    list: () => Promise<DecoderErrors | HttpError | Successful<Environments>>;
    update: (
      environmentId: EnvironmentId,
      input: UpdateEnvironmentInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Environment>>;
  };
  events: {
    ack: (
      eventId: EventId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    create: (input: CreateEventInput) => Promise<DecoderErrors | HttpError | Successful<Event>>;
    get: (eventId: EventId) => Promise<DecoderErrors | HttpError | Successful<Event>>;
    list: (
      queryParams?: ListEventsQueryParams,
    ) => Promise<DecoderErrors | HttpError | Successful<Events>>;
  };
  files: {
    delete: (
      fileId: FileId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    download: (fileId: FileId) => Promise<DecoderErrors | HttpError | Successful<FileContents>>;
    get: (fileId: FileId) => Promise<DecoderErrors | HttpError | Successful<File_>>;
    list: (
      queryParams?: ListFilesQueryParams,
    ) => Promise<DecoderErrors | HttpError | Successful<Files>>;
    update: (
      fileId: FileId,
      input: UpdateFileInput,
    ) => Promise<DecoderErrors | HttpError | Successful<File_>>;
    upload: (
      file: File | ReadStream,
      input: UploadFileInput,
    ) => Promise<DecoderErrors | HttpError | Successful<File_>>;
  };
  jobs: {
    ack: (
      jobId: JobId,
      input: AcknowledgeJobInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Job>>;
    ackOutcome: (jobId: JobId) => Promise<DecoderErrors | HttpError | Successful<Job>>;
    cancel: (
      jobId: JobId,
      input: CancelJobInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Job>>;
    complete: (
      jobId: JobId,
      input: CompleteJobInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Job>>;
    create: (input: CreateJobInput) => Promise<DecoderErrors | HttpError | Successful<Job>>;
    delete: (jobId: JobId) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    execute: (
      jobId: JobId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    fail: (
      jobId: JobId,
      input?: FailJobInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Job>>;
    get: (jobId: JobId) => Promise<DecoderErrors | HttpError | Successful<Job>>;
    list: () => Promise<DecoderErrors | HttpError | Successful<Jobs>>;
    update: (
      jobId: JobId,
      input: UpdateJobInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Job>>;
  };
  records: {
    delete: (
      sheetId: SheetId,
      ids: ReadonlyArray<RecordId>,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (
      sheetId: SheetId,
      queryParams?: ListRecordsQueryParams,
    ) => Promise<DecoderErrors | HttpError | Successful<Records>>;
    insert: (
      sheetId: SheetId,
      input: ReadonlyArray<RecordWithLinks>,
    ) => Promise<DecoderErrors | HttpError | Successful<Records>>;
    update: (
      sheetId: SheetId,
      input: ReadonlyArray<RecordWithLinks>,
      queryParams?: UpdateRecordsQueryParams,
    ) => Promise<DecoderErrors | HttpError | Successful<Records>>;
  };
  secrets: {
    delete: (
      secretId: SecretId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    list: (spaceId?: SpaceId) => Promise<DecoderErrors | HttpError | Successful<Secrets>>;
    upsert: (input: UpsertSecretInput) => Promise<DecoderErrors | HttpError | Successful<Secret>>;
  };
  sheets: {
    delete: (
      sheetId: SheetId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (sheetId: SheetId) => Promise<DecoderErrors | HttpError | Successful<Sheet>>;
    list: () => Promise<DecoderErrors | HttpError | Successful<Sheets>>;
  };
  spaces: {
    archive: (
      spaceId: SpaceId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    create: (input: CreateSpaceInput) => Promise<DecoderErrors | HttpError | Successful<Space>>;
    delete: (
      spaceId: SpaceId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (spaceId: SpaceId) => Promise<DecoderErrors | HttpError | Successful<Space>>;
    list: () => Promise<DecoderErrors | HttpError | Successful<Spaces>>;
    update: (
      spaceId: SpaceId,
      input: UpdateSpaceInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Space>>;
  };
  versions: {
    create: (
      sheetId: SheetId,
      parentVersionId: VersionId,
    ) => Promise<DecoderErrors | HttpError | Successful<Version>>;
  };
  workbooks: {
    create: (
      input: CreateWorkbookInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Workbook>>;
    delete: (
      workbookId: WorkbookId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (workbookId: WorkbookId) => Promise<DecoderErrors | HttpError | Successful<Workbook>>;
    list: () => Promise<DecoderErrors | HttpError | Successful<Workbooks>>;
    update: (
      workbookId: WorkbookId,
      input: UpdateWorkbookInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Workbook>>;
  };
}

export default function mkApiClient(
  secret: string,
  environmentId: EnvironmentId,
  options?: {
    loggerLevel: "debug" | "trace";
  },
): ApiClient {
  const instance = axios.create({
    baseURL: "https://platform.flatfile.com/api/v1",
    headers: {
      Authorization: `Bearer ${secret}`,
      "User-Agent": `${pkgJson.name}/v${pkgJson.version}`,
    },
  });

  instance.interceptors.request.use(
    (config) => {
      const logger = mkLogger(pkgJson.name);
      const stringify = (json: Record<string, any>) => JSON.stringify(json, null, 2);

      match(options?.loggerLevel)
        .with("debug", () => {
          logger.debug(
            stringify({
              headers: {
                ...config.headers,
                Authorization: undefined,
              },
              method: config.method?.toUpperCase(),
              baseUrl: config.baseURL,
              path: config.url,
              params: config.params,
              body: config.data,
            }),
          );
        })
        .with("trace", () => {
          logger.trace(
            stringify({
              headers: config.headers,
              method: config.method?.toUpperCase(),
              baseUrl: config.baseURL,
              path: config.url,
              params: config.params,
              body: config.data,
            }),
          );
        })
        .otherwise(constVoid);

      return config;
    },
    (error) => Promise.reject(error),
  );

  const reader: ApiReader = {
    axios: instance,
    environmentId,
  };

  return {
    agents: {
      create: (input) => createAgent(input)(reader)(),
      delete: (agentId) => deleteAgent(agentId)(reader)(),
      get: (agentId) => getAgent(agentId)(reader)(),
      list: () => listAgents()(reader)(),
    },
    documents: {
      create: (spaceId, input) => createDocument(spaceId, input)(reader)(),
      delete: (documentId, spaceId) => deleteDocument(documentId, spaceId)(reader)(),
      get: (documentId, spaceId) => getDocument(documentId, spaceId)(reader)(),
      list: (spaceId) => listDocuments(spaceId)(reader)(),
      update: (documentId, spaceId, input) => updateDocument(documentId, spaceId, input)(reader)(),
    },
    environments: {
      create: (input) => createEnvironment(input)(reader)(),
      delete: (environmentId) => deleteEnvironment(environmentId)(reader)(),
      get: (environmentId) => getEnvironment(environmentId)(reader)(),
      list: () => listEnvironments()(reader)(),
      update: (environmentId, input) => updateEnvironment(environmentId, input)(reader)(),
    },
    events: {
      ack: (eventId) => acknowledgeEvent(eventId)(reader)(),
      create: (input) => createEvent(input)(reader)(),
      get: (eventId) => getEvent(eventId)(reader)(),
      list: (queryParams) => listEvents(queryParams)(reader)(),
    },
    files: {
      delete: (fileId) => deleteFile(fileId)(reader)(),
      download: (fileId) => downloadFile(fileId)(reader)(),
      get: (fileId) => getFile(fileId)(reader)(),
      list: (queryParams) => listFiles(queryParams)(reader)(),
      update: (fileId, input) => updateFile(fileId, input)(reader)(),
      upload: (file, input) => uploadFile(file, input)(reader)(),
    },
    jobs: {
      ack: (jobId, input) => acknowledgeJob(jobId, input)(reader)(),
      ackOutcome: (jobId) => acknowledgeJobOutcome(jobId)(reader)(),
      cancel: (jobId, input) => cancelJob(jobId, input)(reader)(),
      complete: (jobId, input) => completeJob(jobId, input)(reader)(),
      create: (input) => createJob(input)(reader)(),
      delete: (jobId) => deleteJob(jobId)(reader)(),
      execute: (jobId) => executeJob(jobId)(reader)(),
      fail: (jobId, input) => failJob(jobId, input)(reader)(),
      get: (jobId) => getJob(jobId)(reader)(),
      list: () => listJobs()(reader)(),
      update: (jobId, input) => updateJob(jobId, input)(reader)(),
    },
    records: {
      delete: (sheetId, ids) => deleteRecords(sheetId, ids)(reader)(),
      get: (sheetId, queryParams) => listRecords(sheetId, queryParams)(reader)(),
      insert: (sheetId, input) => insertRecords(sheetId, input)(reader)(),
      update: (sheetId, input, queryParams) => updateRecords(sheetId, input, queryParams)(reader)(),
    },
    secrets: {
      delete: (secretId) => deleteSecret(secretId)(reader)(),
      list: (spaceId) => listSecrets(spaceId)(reader)(),
      upsert: (input) => upsertSecret(input)(reader)(),
    },
    sheets: {
      delete: (sheetId) => deleteSheet(sheetId)(reader)(),
      get: (sheetId) => getSheet(sheetId)(reader)(),
      list: () => listSheets()(reader)(),
    },
    spaces: {
      archive: (sheetId) => archiveSpace(sheetId)(reader)(),
      create: (input) => createSpace(input)(reader)(),
      delete: (sheetId) => deleteSpace(sheetId)(reader)(),
      get: (sheetId) => getSpace(sheetId)(reader)(),
      list: () => listSpaces()(reader)(),
      update: (spaceId, input) => updateSpace(spaceId, input)(reader)(),
    },
    versions: {
      create: (sheetId, parentVersionId) => createVersion(sheetId, parentVersionId)(reader)(),
    },
    workbooks: {
      create: (input) => createWorkbook(input)(reader)(),
      delete: (workbookId) => deleteWorkbook(workbookId)(reader)(),
      get: (workbookId) => getWorkbook(workbookId)(reader)(),
      list: () => listWorkbooks()(reader)(),
      update: (workbookId, input) => updateWorkbook(workbookId, input)(reader)(),
    },
  };
}

export { Agent, Agents } from "./lib/agents.mjs";
export { Document, Documents } from "./lib/documents.mjs";
export { Environment, Environments } from "./lib/environments.mjs";
export { Event, Events } from "./lib/events.mjs";
export { File_, Files } from "./lib/files.mjs";
export {
  AgentId,
  DocumentId,
  EnvironmentId,
  EventId,
  FileId,
  GuestId,
  JobId,
  RecordId,
  SecretId,
  SheetId,
  SnapshotId,
  SpaceId,
  UserId,
  VersionId,
  WorkbookId,
  isoAccountId,
  isoAgentId,
  isoDocumentId,
  isoEnvironmentId,
  isoEventId,
  isoFileId,
  isoGuestId,
  isoJobId,
  isoRecordId,
  isoSecretId,
  isoSheetId,
  isoSnapshotId,
  isoSpaceId,
  isoUserId,
  isoVersionId,
  isoWorkbookId,
} from "./lib/ids.mjs";
export { Job, Jobs } from "./lib/jobs.mjs";
export { Secret, Secrets } from "./lib/secrets.mjs";
export { Permission, Sheet, Sheets } from "./lib/sheets.mjs";
export { Space, Spaces } from "./lib/spaces.mjs";
export { Version } from "./lib/versions.mjs";
export { Workbook, Workbooks } from "./lib/workbooks.mjs";
