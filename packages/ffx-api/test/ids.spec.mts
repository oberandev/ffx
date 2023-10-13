import {
  mkAccountId,
  mkAgentId,
  mkDocumentId,
  mkEnvironmentId,
  mkEventId,
  mkFileId,
  mkJobId,
  mkRecordId,
  mkSecretId,
  mkSheetId,
  mkSpaceId,
  mkVersionId,
  mkWorkbookId,
} from "./helpers.mjs";
import {
  AccountIdFromString,
  AgentIdFromString,
  DocumentIdFromString,
  EnvironmentIdFromString,
  EventIdFromString,
  FileIdFromString,
  JobIdFromString,
  RecordIdFromString,
  SecretId,
  SecretIdFromString,
  SheetIdFromString,
  SpaceIdFromString,
  VersionIdFromString,
  WorkbookIdFromString,
} from "../src/lib/ids.mjs";

describe("ids", () => {
  it("AccountId", () => {
    const brandedT = mkAccountId()();

    expect(AccountIdFromString.is(brandedT)).toBe(true);
  });

  it("AgentId", () => {
    const brandedT = mkAgentId()();

    expect(AgentIdFromString.is(brandedT)).toBe(true);
  });

  it("DocumentId", () => {
    const brandedT = mkDocumentId()();

    expect(DocumentIdFromString.is(brandedT)).toBe(true);
  });

  it("EnvironmentId", () => {
    const encoded = mkEnvironmentId()();

    expect(EnvironmentIdFromString.is(encoded)).toBe(true);
  });

  it("EventId", () => {
    const encoded = mkEventId()();

    expect(EventIdFromString.is(encoded)).toBe(true);
  });

  it("FileId", () => {
    const brandedT = mkFileId()();

    expect(FileIdFromString.is(brandedT)).toBe(true);
  });

  it("JobId", () => {
    const brandedT = mkJobId()();

    expect(JobIdFromString.is(brandedT)).toBe(true);
  });

  it("RecordId", () => {
    const brandedT = mkRecordId()();

    expect(RecordIdFromString.is(brandedT)).toBe(true);
  });

  it("SecretId", () => {
    const brandedT: SecretId = mkSecretId()();

    expect(SecretIdFromString.is(brandedT)).toBe(true);
  });

  it("SheetId", () => {
    const brandedT = mkSheetId()();

    expect(SheetIdFromString.is(brandedT)).toBe(true);
  });

  it("SpaceId", () => {
    const brandedT = mkSpaceId()();

    expect(SpaceIdFromString.is(brandedT)).toBe(true);
  });

  it("VersionId", () => {
    const brandedT = mkVersionId()();

    expect(VersionIdFromString.is(brandedT)).toBe(true);
  });

  it("WorkbookId", () => {
    const brandedT = mkWorkbookId()();

    expect(WorkbookIdFromString.is(brandedT)).toBe(true);
  });
});
