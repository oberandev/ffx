import { runParser } from "../src/lib/parser.mjs";

// ["t", "f", "y", "n", "1", "0", "on", "off", "yes", "no", "true", "false"]
describe("Boolean", () => {
  it("should work", () => {
    const parserResult = runParser("t");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["t"],
          cursor: 1,
        },
        start: {
          buffer: ["t"],
          cursor: 0,
        },
        value: true,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("f");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["f"],
          cursor: 1,
        },
        start: {
          buffer: ["f"],
          cursor: 0,
        },
        value: false,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("y");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["y"],
          cursor: 1,
        },
        start: {
          buffer: ["y"],
          cursor: 0,
        },
        value: true,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("n");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["n"],
          cursor: 1,
        },
        start: {
          buffer: ["n"],
          cursor: 0,
        },
        value: false,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("1");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["1"],
          cursor: 1,
        },
        start: {
          buffer: ["1"],
          cursor: 0,
        },
        value: true,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("0");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["0"],
          cursor: 1,
        },
        start: {
          buffer: ["0"],
          cursor: 0,
        },
        value: false,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("on");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["o", "n"],
          cursor: 2,
        },
        start: {
          buffer: ["o", "n"],
          cursor: 0,
        },
        value: true,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("off");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["o", "f", "f"],
          cursor: 3,
        },
        start: {
          buffer: ["o", "f", "f"],
          cursor: 0,
        },
        value: false,
      },
    });
  });

  // this break b/c of the shorthand. need P.eof()??
  it("should work", () => {
    const parserResult = runParser("yes");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["y", "e", "s"],
          cursor: 3,
        },
        start: {
          buffer: ["y", "e", "s"],
          cursor: 0,
        },
        value: true,
      },
    });
  });

  // this break b/c of the shorthand. need P.eof()??
  it("should work", () => {
    const parserResult = runParser("no");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["n", "o"],
          cursor: 2,
        },
        start: {
          buffer: ["n", "o"],
          cursor: 0,
        },
        value: false,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("true");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["t", "r", "u", "e"],
          cursor: 5,
        },
        start: {
          buffer: ["t", "r", "u", "e"],
          cursor: 0,
        },
        value: true,
      },
    });
  });

  it("should work", () => {
    const parserResult = runParser("false");

    expect(parserResult).toStrictEqual({
      _tag: "Right",
      right: {
        next: {
          buffer: ["f", "a", "l", "s", "e"],
          cursor: 6,
        },
        start: {
          buffer: ["f", "a", "l", "s", "e"],
          cursor: 0,
        },
        value: false,
      },
    });
  });
});
