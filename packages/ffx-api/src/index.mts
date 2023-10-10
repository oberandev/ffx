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
  DeleteDocumentInput,
  Document,
  Documents,
  SpaceId,
  GetDocumentInput,
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
  CreateSheetInput,
  Sheet,
  SheetId,
  Sheets,
  UpdateSheetInput,
  createSheet,
  deleteSheet,
  getSheet,
  listSheets,
  updateSheet,
} from "./lib/sheets.mjs";
import { ApiReader, DecoderErrors, HttpError, Successful } from "./lib/types.mjs";
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
      input: CreateDocumentInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Document>>;
    delete: (
      input: DeleteDocumentInput,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (input: GetDocumentInput) => Promise<DecoderErrors | HttpError | Successful<Document>>;
    list: (spaceId: SpaceId) => Promise<DecoderErrors | HttpError | Successful<Documents>>;
    update: (
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
      input: UpdateEnvironmentInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Environment>>;
  };
  sheets: {
    create: (input: CreateSheetInput) => Promise<DecoderErrors | HttpError | Successful<Sheet>>;
    delete: (
      sheetId: SheetId,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (sheetId: SheetId) => Promise<DecoderErrors | HttpError | Successful<Sheet>>;
    list: () => Promise<DecoderErrors | HttpError | Successful<Sheets>>;
    update: (input: UpdateSheetInput) => Promise<DecoderErrors | HttpError | Successful<Sheet>>;
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
      input: UpdateWorkbookInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Workbook>>;
  };
}

export default function mkApiClient(secret: string, environmentId: string): ApiClient {
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
      create: (input) => createDocument(input)(reader)(),
      delete: (input) => deleteDocument(input)(reader)(),
      get: (input) => getDocument(input)(reader)(),
      list: (spaceId) => listDocuments(spaceId)(reader)(),
      update: (input) => updateDocument(input)(reader)(),
    },
    environments: {
      create: (input) => createEnvironment(input)(reader)(),
      delete: (environmentId) => deleteEnvironment(environmentId)(reader)(),
      get: (environmentId) => getEnvironment(environmentId)(reader)(),
      list: () => listEnvironments()(reader)(),
      update: (input) => updateEnvironment(input)(reader)(),
    },
    sheets: {
      create: (input) => createSheet(input)(reader)(),
      delete: (sheetId) => deleteSheet(sheetId)(reader)(),
      get: (sheetId) => getSheet(sheetId)(reader)(),
      list: () => listSheets()(reader)(),
      update: (input) => updateSheet(input)(reader)(),
    },
    workbooks: {
      create: (input) => createWorkbook(input)(reader)(),
      delete: (workbookId) => deleteWorkbook(workbookId)(reader)(),
      get: (workbookId) => getWorkbook(workbookId)(reader)(),
      list: () => listWorkbooks()(reader)(),
      update: (input) => updateWorkbook(input)(reader)(),
    },
  };
}
