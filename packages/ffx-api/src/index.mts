import * as Agents from "./lib/agents.mjs";
import pkgJson from "../package.json"; // eslint-disable-line import/no-relative-parent-imports

interface ApiClient {
  agents: {
    create: (
      input: Agents.CreateAgentInput,
    ) => Promise<Agents.DecoderErrors | Agents.HttpError | Agents.Successful<Agents.Agent>>;
    delete: (
      agentId: string,
    ) => Promise<Agents.DecoderErrors | Agents.HttpError | Agents.Successful<{ success: boolean }>>;
    get: (
      agentId: string,
    ) => Promise<Agents.DecoderErrors | Agents.HttpError | Agents.Successful<Agents.Agent>>;
    list: () => Promise<Agents.DecoderErrors | Agents.HttpError | Agents.Successful<Agents.Agents>>;
  };
}

export default function mkApiClient(secret: string, environmentId: string): ApiClient {
  const reader: Agents.ApiReader = {
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
      create: (input) => Agents.createAgent(input)(reader)(),
      delete: (agentId) => Agents.deleteAgent(agentId)(reader)(),
      get: (agentId) => Agents.getAgent(agentId)(reader)(),
      list: () => Agents.listAgents()(reader)(),
    },
  };
}
