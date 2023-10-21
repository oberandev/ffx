import { parse } from "../src/lib/parser.mjs";

describe("Boolean", () => {
  it("[shortform] should handle 't'", () => {
    const result = parse("t");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: true,
    });
  });

  it("[shortform] should handle 'f'", () => {
    const result = parse("f");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: false,
    });
  });

  it("[shortform] should handle 'y'", () => {
    const result = parse("y");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: true,
    });
  });

  it("[shortform] should handle 'n'", () => {
    const result = parse("n");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: false,
    });
  });

  it("[shortform] should handle '1'", () => {
    const result = parse("1");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: true,
    });
  });

  it("[shortform] should handle '0'", () => {
    const result = parse("0");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: false,
    });
  });

  it("[longform] should handle 'on'", () => {
    const result = parse("on");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: true,
    });
  });

  it("[longform] should handle 'off'", () => {
    const result = parse("off");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: false,
    });
  });

  it("[longform] should handle 'yes'", () => {
    const result = parse("yes");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: true,
    });
  });

  it("[longform] should handle 'no'", () => {
    const result = parse("no");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: false,
    });
  });

  it("[longform] should handle 'true'", () => {
    const result = parse("true");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: true,
    });
  });

  it("[longform] should handle 'false'", () => {
    const result = parse("false");

    expect(result).toStrictEqual({
      _tag: "Right",
      right: false,
    });
  });

  it("[invalid] should handle 'tr'", () => {
    const result = parse("tr");

    expect(result).toStrictEqual({
      _tag: "Left",
      left: 'Expected "true" but found "tr"',
    });
  });

  it("[invalid] should handle 'ye'", () => {
    const result = parse("ye");

    expect(result).toStrictEqual({
      _tag: "Left",
      left: 'Expected "yes" but found "ye"',
    });
  });

  it("[invalid] should handle '10'", () => {
    const result = parse("10");

    expect(result).toStrictEqual({
      _tag: "Left",
      left: 'Expected end of string but found "10"',
    });
  });

  it("[invalid] should handle '01'", () => {
    const result = parse("01");

    expect(result).toStrictEqual({
      _tag: "Left",
      left: 'Expected end of string but found "01"',
    });
  });

  it("[invalid] should handle 'yess'", () => {
    const result = parse("yess");

    expect(result).toStrictEqual({
      _tag: "Left",
      left: 'Expected end of string but found "yess"',
    });
  });

  it("[invalid] should handle 'noo'", () => {
    const result = parse("noo");

    expect(result).toStrictEqual({
      _tag: "Left",
      left: 'Expected end of string but found "noo"',
    });
  });
});
