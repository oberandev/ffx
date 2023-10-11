import {
  Agent,
  AgentId,
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
  DocumentId,
  Documents,
  SpaceId,
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
  EnvironmentId,
  Environments,
  UpdateEnvironmentInput,
  createEnvironment,
  deleteEnvironment,
  getEnvironment,
  listEnvironments,
  updateEnvironment,
} from "./lib/environments.mjs";
import {
  CreateSecretInput,
  Secret,
  SecretId,
  Secrets,
  createSecret,
  deleteSecret,
  listSecrets,
} from "./lib/secrets.mjs";
import { Sheet, SheetId, Sheets, deleteSheet, getSheet, listSheets } from "./lib/sheets.mjs";
import { ApiReader, DecoderErrors, HttpError, Successful } from "./lib/types.mjs";
import { Version, VersionId, createVersion } from "./lib/versions.mjs";
import {
  CreateWorkbookInput,
  UpdateWorkbookInput,
  Workbook,
  WorkbookId,
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
  secrets: {
    create: (input: CreateSecretInput) => Promise<DecoderErrors | HttpError | Successful<Secret>>;
    delete: (
      secretId: SecretId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    list: (
      environmentId: EnvironmentId,
      spaceId?: SpaceId,
    ) => Promise<DecoderErrors | HttpError | Successful<Secrets>>;
  };
  sheets: {
    delete: (
      sheetId: SheetId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (sheetId: SheetId) => Promise<DecoderErrors | HttpError | Successful<Sheet>>;
    list: () => Promise<DecoderErrors | HttpError | Successful<Sheets>>;
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
  const reader: ApiReader = {
    baseUrl: "https://platform.flatfile.com/api/v1",
    environmentId,
    pkgJson: {
      name: pkgJson.name,
      version: pkgJson.version,
    },
    secret,
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
    secrets: {
      create: (input) => createSecret(input)(reader)(),
      delete: (secretId) => deleteSecret(secretId)(reader)(),
      list: (environmentId, spaceId) => listSecrets(environmentId, spaceId)(reader)(),
    },
    sheets: {
      delete: (sheetId) => deleteSheet(sheetId)(reader)(),
      get: (sheetId) => getSheet(sheetId)(reader)(),
      list: () => listSheets()(reader)(),
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

export { Agent, Agents, AgentId, EventTopic, isoAgentId } from "./lib/agents.mjs";
export {
  Document,
  Documents,
  DocumentId,
  SpaceId,
  isoDocumentId,
  isoSpaceId,
} from "./lib/documents.mjs";
export {
  AccountId,
  Environment,
  Environments,
  EnvironmentId,
  isoAccountId,
  isoEnvironmentId,
} from "./lib/environments.mjs";
export { Secret, Secrets, SecretId, isoSecretId } from "./lib/secrets.mjs";
export { Permission, Sheet, Sheets, SheetId, isoSheetId } from "./lib/sheets.mjs";
export { Version, VersionId, isoVersionId } from "./lib/versions.mjs";
export { Workbook, Workbooks, WorkbookId, isoWorkbookId } from "./lib/workbooks.mjs";
