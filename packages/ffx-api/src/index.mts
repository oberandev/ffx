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
  DeleteDocumentInput,
  Document,
  Documents,
  GetDocumentInput,
  UpdateDocumentInput,
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from "./lib/documents.mjs";
import { ApiReader, DecoderErrors, HttpError, Successful } from "./lib/types.mjs";
import pkgJson from "../package.json"; // eslint-disable-line import/no-relative-parent-imports

interface ApiClient {
  agents: {
    create: (input: CreateAgentInput) => Promise<DecoderErrors | HttpError | Successful<Agent>>;
    delete: (
      agentId: string,
    ) => Promise<DecoderErrors | HttpError | Successful<{ success: boolean }>>;
    get: (agentId: string) => Promise<DecoderErrors | HttpError | Successful<Agent>>;
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
    list: (spaceId: string) => Promise<DecoderErrors | HttpError | Successful<Documents>>;
    update: (
      input: UpdateDocumentInput,
    ) => Promise<DecoderErrors | HttpError | Successful<Document>>;
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
  };
}
