import axios from "axios";

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
  File,
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
  Record,
  Records,
  UpdateRecordsQueryParams,
  deleteRecords,
  insertRecords,
  listRecords,
  updateRecords,
} from "./lib/records.mjs";
import {
  CreateSecretInput,
  Secret,
  Secrets,
  createSecret,
  deleteSecret,
  listSecrets,
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
  files: {
    delete: (
      fileId: FileId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    download: (fileId: FileId) => Promise<DecoderErrors | HttpError | Successful<FileContents>>;
    get: (fileId: FileId) => Promise<DecoderErrors | HttpError | Successful<File>>;
    list: (
      queryParams?: ListFilesQueryParams,
    ) => Promise<DecoderErrors | HttpError | Successful<Files>>;
    update: (
      fileId: FileId,
      input: UpdateFileInput,
    ) => Promise<DecoderErrors | HttpError | Successful<File>>;
    upload: (input: UploadFileInput) => Promise<DecoderErrors | HttpError | Successful<File>>;
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
      input: FailJobInput,
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
      input: ReadonlyArray<Record>,
    ) => Promise<DecoderErrors | HttpError | Successful<Records>>;
    update: (
      sheetId: SheetId,
      input: ReadonlyArray<Record>,
      queryParams?: UpdateRecordsQueryParams,
    ) => Promise<DecoderErrors | HttpError | Successful<Records>>;
  };
  secrets: {
    create: (input: CreateSecretInput) => Promise<DecoderErrors | HttpError | Successful<Secret>>;
    delete: (
      secretId: SecretId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    list: (spaceId?: SpaceId) => Promise<DecoderErrors | HttpError | Successful<Secrets>>;
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

export default function mkApiClient(secret: string, environmentId: EnvironmentId): ApiClient {
  const instance = axios.create({
    baseURL: "https://platform.flatfile.com/api/v1",
    headers: {
      Authorization: `Bearer ${secret}`,
      "User-Agent": `${pkgJson.name}/v${pkgJson.version}`,
    },
  });

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
    files: {
      delete: (fileId) => deleteFile(fileId)(reader)(),
      download: (fileId) => downloadFile(fileId)(reader)(),
      get: (fileId) => getFile(fileId)(reader)(),
      list: (queryParams) => listFiles(queryParams)(reader)(),
      update: (fileId, input) => updateFile(fileId, input)(reader)(),
      upload: (input) => uploadFile(input)(reader)(),
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
      create: (input) => createSecret(input)(reader)(),
      delete: (secretId) => deleteSecret(secretId)(reader)(),
      list: (spaceId) => listSecrets(spaceId)(reader)(),
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

export { Agent, Agents, EventTopic } from "./lib/agents.mjs";
export { Document, Documents } from "./lib/documents.mjs";
export { Environment, Environments } from "./lib/environments.mjs";
export { File, Files } from "./lib/files.mjs";
export {
  AgentId,
  DocumentId,
  EnvironmentId,
  FileId,
  JobId,
  RecordId,
  SecretId,
  SheetId,
  SpaceId,
  VersionId,
  WorkbookId,
  isoAccountId,
  isoAgentId,
  isoDocumentId,
  isoEnvironmentId,
  isoFileId,
  isoJobId,
  isoRecordId,
  isoSecretId,
  isoSheetId,
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
