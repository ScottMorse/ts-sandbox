import { createStore } from "zustand/vanilla";
import { DeeplyPartial } from "../lib/types";
import { merge } from "lodash";

interface AsmSymbol {
  address: number;
}

interface Instruction {
  kind: "A" | "C";
  value: number;
  metadata: Record<string, string | number>;
}

type SymbolMap = { [name: string]: AsmSymbol[] };

export interface AssemblerResult {
  symbols: {
    label: SymbolMap;
    memory: SymbolMap;
  };
  instructions: Instruction[];
}

export type InstructionPartType =
  | "whitespace"
  | "comment"
  | "multilineComment"
  | "A"
  | "cABit"
  | "cComp"
  | "cDestination"
  | "cJump";

export interface CurrentInstruction {
  partType: InstructionPartType;
  value: string;
}

export interface AssemblerState {
  line: number;
  position: number;
  result: AssemblerResult;
  currentInstruction: CurrentInstruction;
  isFinished: boolean;
}

type StateChanger = (state: AssemblerState) => Partial<AssemblerState>;

const throwError = (
  message: string,
  state: AssemblerState,
  ErrorType = Error
) => {
  throw new ErrorType(
    `${message} (line ${state.line} position ${state.position})`
  );
};

const HANDLERS: Record<
  InstructionPartType,
  Record<
    | "space"
    | "newLine"
    | "backslash"
    | "digit"
    | "alpha"
    | "semicolon"
    | "paren"
    | "star",
    StateChanger
  >
> = {
  whitespace: {
    space: () => ({}),
    newLine: () => ({}),
    backslash: () => ({}),
    digit: () => ({}),
    alpha: () => ({}),
    semicolon: () => ({}),
    paren: () => ({}),
    star: () => ({}),
  },
  comment: {
    space: () => ({}),
    newLine: () => ({}),
    backslash: () => ({}),
    digit: () => ({}),
    alpha: () => ({}),
    semicolon: () => ({}),
    paren: () => ({}),
    star: () => ({}),
  },
  multilineComment: {
    space: () => ({}),
    newLine: () => ({}),
    backslash: () => ({}),
    digit: () => ({}),
    alpha: () => ({}),
    semicolon: () => ({}),
    paren: () => ({}),
    star: () => ({}),
  },
  A: {
    space: () => ({}),
    newLine: () => ({}),
    backslash: () => ({}),
    digit: () => ({}),
    alpha: () => ({}),
    semicolon: () => ({}),
    paren: () => ({}),
    star: () => ({}),
  },
  cABit: {
    space: () => ({}),
    newLine: () => ({}),
    backslash: () => ({}),
    digit: () => ({}),
    alpha: () => ({}),
    semicolon: () => ({}),
    paren: () => ({}),
    star: () => ({}),
  },
  cComp: {
    space: () => ({}),
    newLine: () => ({}),
    backslash: () => ({}),
    digit: () => ({}),
    alpha: () => ({}),
    semicolon: () => ({}),
    paren: () => ({}),
    star: () => ({}),
  },
  cDestination: {
    space: () => ({}),
    newLine: () => ({}),
    backslash: () => ({}),
    digit: () => ({}),
    alpha: () => ({}),
    semicolon: () => ({}),
    paren: () => ({}),
    star: () => ({}),
  },
  cJump: {
    space: () => ({}),
    newLine: () => ({}),
    backslash: () => ({}),
    digit: () => ({}),
    alpha: () => ({}),
    semicolon: () => ({}),
    paren: () => ({}),
    star: () => ({}),
  },
};

const splitSourceLines = (source: string) =>
  source.replace(/\r\n?/gm, "\n").split("\n");

export const assemble = (source: string): AssemblerState["result"] => {
  const lines = splitSourceLines(source);

  interface AssemblerStoreState extends AssemblerState {
    incrementPosition: () => void;
    parseNext: () => void;
    updateResult: (result: DeeplyPartial<AssemblerResult>) => void;
  }

  const parse = (state: AssemblerState) => {
    const { line, position, isFinished, result } = state;
    const char = lines[line][position];

    if (isFinished || char === undefined) {
      return {};
    }

    const newState: Partial<AssemblerState> = {};

    const handlers = HANDLERS[state.currentInstruction.partType];

    if (char === "\n") {
      return handlers.newLine(state);
    } else if (char.match(/\s/)) {
      return handlers.space(state);
    } else if (char.match(/\d/)) {
      return handlers.digit(state);
    } else if (char.match(/[a-zA-Z]/)) {
      return handlers.alpha(state);
    } else if (char === "/") {
      return handlers.backslash(state);
    } else if (char === ";") {
      return handlers.semicolon(state);
    } else if (char === "(" || char === ")") {
      return handlers.paren(state);
    } else if (char === "*") {
      return handlers.star(state);
    }

    throwError(`Unexpected character ${char}`, state);

    return {};
  };

  const store = createStore<AssemblerStoreState>((set) => ({
    line: 0,
    position: 0,
    result: {
      symbols: {
        label: {},
        memory: {},
      },
      instructions: [],
    },
    currentInstruction: {
      partType: "whitespace",
      value: "",
    },
    isFinished: false,
    incrementPosition: () =>
      set((state) => {
        if (state.isFinished) {
          console.warn("Assembler is finished, cannot increment position");
          return state;
        }

        const newState: Partial<AssemblerStoreState> = {};

        if (state.position >= lines[state.line].length - 1) {
          if (state.line === lines.length - 1) {
            newState.isFinished = true;
          } else {
            newState.line = state.line + 1;
            newState.position = 0;
          }
        } else {
          newState.position = state.position + 1;
        }

        return newState;
      }),
    parseNext: () => set((state) => parse(state)),
    updateResult: (result) =>
      set((state) => ({ result: merge({}, state.result, result) })),
  }));

  const expectedLoopCount = lines.reduce(
    (count, line) => count + Math.max(line.length || 1),
    1
  );

  let loopCount = 0;
  let isFinished = false;
  while (!isFinished) {
    if (loopCount > expectedLoopCount) {
      throw new Error(
        `Loop count exceeded expected loop count ${expectedLoopCount}`
      );
    }

    const {
      line,
      position,
      result: { symbols, instructions },
      updateResult,
      incrementPosition,
      parseNext,
    } = store.getState();

    const char = lines[line][position];

    incrementPosition();

    parseNext();

    isFinished = store.getState().isFinished;

    loopCount++;
  }

  return store.getState().result;
};
