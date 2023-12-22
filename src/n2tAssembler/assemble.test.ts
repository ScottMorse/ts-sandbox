import { DeeplyPartial } from "../lib/types";
import { assemble } from "./assemble";
import merge from "lodash/merge";
import { AssemblerResult, AssemblerState, createInitialState } from "./state";

const createTest = (shouldThrow: boolean) => (
  name: string,
  source: string,
  result?: DeeplyPartial<AssemblerResult>[],
) => ({
  name,
  source,
  result: merge({}, createInitialState(source).result, result),
  shouldThrow,
});

const createResult = createTest(false);
const createError = createTest(true);

const createTests = (tests: ReturnType<typeof createResult>[]) =>
  test.each<ReturnType<typeof createResult>>(tests.slice())(
    "$name",
    ({ source, result, shouldThrow }) =>
      shouldThrow
        ? expect(() => assemble(source)).toThrow()
        : expect(assemble(source)).toEqual(result)
  );

const createRandomString = (charSet: string, length: number) =>
  [...Array(length).keys()]
    .map(() => charSet[Math.floor(Math.random() * charSet.length)])
    .join("");

describe("Test assembler", () => {
  describe.skip("Whitespace only", () => {
    createTests([
      createResult("Empty", ""),
      createResult("Whitespace 1", " "),
      createResult("Whitespace 2", "  "),
      createResult("Whitespace 3", " \n  "),
      createResult("Whitespace 4", "\t  \n  \t"),
      ...[...Array(20).keys()].map((i) =>
        createResult(
          `Whitespace random ${i + 1}`,
          createRandomString(" \t\n", Math.round(Math.random() * 100))
        )
      ),
    ]);
  });

  describe("Single line comments only", () => {
    createTests([
      createResult("Comment 1", "//"),
      createResult("Comment 2", "//\n"),
      createResult("Comment 3", "//\n//"),
      createResult("Comment 4", "//\n//\n"),
      createResult("Comment 5", "//\n//\n//"),
      createResult("Comment 6", "//\n//\n//\n"),
      createResult("Comment 7", "//\n//\n//\n//"),
      createResult("Comment 8", "//\n//\n//\n//\n"),
      createResult("Comment 9", "//\n//\n//\n//\n//"),
      createResult("Comment 10", "//\n//\n//\n//\n//\n"),
      createResult("Comment 11", "//\n//\n//\n//\n//\n//"),
      createResult("Comment 12", "//\n//\n//\n//\n//\n//\n"),
      createResult("Comment 13", "//\n//\n//\n//\n//\n//\n//"),
      createResult("Comment 14", "//\n//\n//\n//\n//\n//\n//\n"),
      createResult("Comment 15", "//\n//\n//\n//\n//\n//\n//\n//"),
      createResult(
        "Comment Words 1",
        "// Hi this is some (kind of comment))( blah blah;;;@R01"
      ),
      createResult(
        "Comment Words 2",
        "// Hi this is some (kind of comment) i guess lol!!123*/)( blah blah;;;@R01// //\n// Another comment"
      ),
      createResult(
        "Comment Words 3",
        "//It was the best of times; it was the blurst of times"
      ),
    ]);
  });

  describe("Multi line comments only", () => {
    createTests([
      createResult("Comment 1", "/*"),
      createResult("Comment 2", "/*\n"),
      createResult("Comment 3", "/*\n*/"),
      createResult("Comment 4", "/*\n*/\n"),
      createResult("Comment 5", "/*\n*/"),
      createResult("Comment 6", "/* something */"),
      createResult("Comment 7", "/* something\n*/"),
      createResult("Comment 8", "/* something\n*/\n"),
      createResult("Comment 9", "/* some\nthing\n*/\n"),
    ]);
  });
});
