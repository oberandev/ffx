import { CustomAction } from "./custom_action.mjs";
import { Sheet } from "./sheet.mjs";

interface Workbook {
  readonly actions?: ReadonlyArray<CustomAction>;
  readonly environmentId?: string;
  readonly labels?: ReadonlyArray<string>;
  readonly name: string;
  readonly sheets?: ReadonlyArray<Sheet>;
  readonly spaceId?: string;
}

interface Builder {
  done: () => Workbook;
}

export class WorkbookBuilder implements Builder {
  readonly #name: string;

  constructor(name: string) {
    this.#name = name;
  }

  done(): Workbook {
    return {
      name: this.#name,
    };
  }
}
