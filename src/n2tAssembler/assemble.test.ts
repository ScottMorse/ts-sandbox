import { DeeplyPartial } from "../lib/types";
import { AssemblerState, assemble } from "./assemble";
import merge from "lodash/merge";

const createState = (
  ...states: DeeplyPartial<AssemblerState>[]
): AssemblerState =>
  merge(
    {
      symbols: {
        label: {},
        memory: {},
      },
      instructions: [],
    },
    ...states
  );

describe("Test assembler", () => {
  test.each<{ source: string; name: string; result: AssemblerState }>(
    [
      {
        name: "Empty",
        source: "",
        result: createState(),
      },
      {
        name: "Whitespace 1",
        source: " ",
        result: createState(),
      },
      {
        name: "Whitespace 2",
        source: "  ",
        result: createState(),
      },
      {
        name: "Whitespace 3",
        source: " \n  ",
        result: createState(),
      },
      {
        name: "Whitespace 4",
        source: "\t  \n  \t",
        result: createState(),
      },
      ...[...Array(20).keys()].map((i) => ({
        name: `Whitespace random ${i + 1}`,
        source: [...Array(Math.round(Math.random() * 100)).keys()]
          .map(() => " \n\t\r"[Math.floor(Math.random() * 3)])
          .join(""),
        result: createState(),
      })),
      {
        name: "Comment 1",
        source: "//",
        result: createState(),
      },
      {
        name: "Comment 2",
        source: "//\n",
        result: createState(),
      },
      {
        name: "Comment 3",
        source: "//\n//",
        result: createState(),
      },
      {
        name: "Comment 4",
        source: "//\n//\n",
        result: createState(),
      },
      {
        name: "Comment 5",
        source: "//\n//\n//",
        result: createState(),
      },
      {
        name: "Comment 6",
        source: "//\n//\n//\n",
        result: createState(),
      },
      {
        name: "Comment 7",
        source: "//\n//\n//\n//",
        result: createState(),
      },
      {
        name: "Comment 8",
        source: "//\n//\n//\n//\n",
        result: createState(),
      },
      {
        name: "Comment 9",
        source: "//\n//\n//\n//\n//",
        result: createState(),
      },
      {
        name: "Comment 10",
        source: "//\n//\n//\n//\n//\n",
        result: createState(),
      },
      {
        name: "Comment 11",
        source: "//\n//\n//\n//\n//\n//",
        result: createState(),
      },
      {
        name: "Comment 12",
        source: "//\n//\n//\n//\n//\n//\n",
        result: createState(),
      },
      {
        name: "Comment 13",
        source: "//\n//\n//\n//\n//\n//\n//",
        result: createState(),
      },
      {
        name: "Comment 14",
        source: "//\n//\n//\n//\n//\n//\n//\n",
        result: createState(),
      },
      {
        name: "Comment 15",
        source: "//\n//\n//\n//\n//\n//\n//\n//",
        result: createState(),
      },
    ].slice()
  )("$name", ({ source, result }) =>
    expect({ source, result: assemble(source) }).toEqual({ source, result })
  );
});
