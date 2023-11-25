import { curry } from "../lib/curry";
import { AssemblerState, InstructionPartType, createError } from "./state";

type StateChanger = (
  state: AssemblerState,
  char: string,
  prevChar: string | undefined
) => void;

const doNothing = () => {};

const throwIllegal = curry(
  (extraMessage: string, state: AssemblerState, char: string) => {
    throw createError(
      `Unexpected character ${char}${
        extraMessage ? "(" + extraMessage + ")" : ""
      }`,
      state
    );
  }
);

const throwDefaultIllegal = throwIllegal("");

const HANDLERS: Record<
  InstructionPartType,
  Record<
    | "space"
    | "newLine"
    | "backslash"
    | "at"
    | "equal"
    | "digit"
    | "alpha"
    | "semicolon"
    | "paren"
    | "star"
    | "other",
    StateChanger
  >
> = {
  null: {
    space: doNothing,
    newLine: doNothing,
    at: (state) => {
      state.currentInstruction = {
        partType: "A",
        value: "",
      };
    },
    backslash: (state, _char, prevChar) => {
      if (prevChar === "/") {
        state.currentInstruction = {
          partType: "comment",
          value: "",
        };
      }
    },
    equal: throwDefaultIllegal,
    digit: (state) => {},
    alpha: (state) => {},
    semicolon: (state) => {},
    paren: (state) => {},
    star: (state, _char, prevChar) => {
      if (prevChar === "/") {
        state.currentInstruction = {
          partType: "multilineComment",
          value: "",
        };
      }
    },
    other: throwDefaultIllegal,
  },
  comment: {
    space: doNothing,
    newLine: (state) => {
      if (state.currentInstruction.partType === "comment") {
        state.currentInstruction = {
          partType: "null",
          value: "",
        };
      }
    },
    at: doNothing,
    equal: doNothing,
    backslash: doNothing,
    digit: doNothing,
    alpha: doNothing,
    semicolon: doNothing,
    paren: doNothing,
    star: doNothing,
    other: doNothing,
  },
  multilineComment: {
    space: doNothing,
    newLine: doNothing,
    at: doNothing,
    backslash: (state, _char, prevChar) => {
      if (prevChar === "*") {
        state.currentInstruction = {
          partType: "null",
          value: "",
        };
      }
    },
    equal: doNothing,
    digit: doNothing,
    alpha: doNothing,
    semicolon: doNothing,
    paren: doNothing,
    star: doNothing,
    other: doNothing,
  },
  label: {
    space: doNothing,
    at: throwDefaultIllegal,
    newLine: (state) => {},
    backslash: (state) => {},
    digit: (state) => {
      if (state.currentInstruction.value.length === 0) {
        throwIllegal("label cannot start with number", state, "digit");
      }
    },
    alpha: (state, char) => {
      state.currentInstruction.value += char;
    },
    semicolon: throwDefaultIllegal,
    equal: throwDefaultIllegal,
    paren: (state, char) => {
      if (char === ")") {
        state.currentInstruction = {
          partType: "null",
          value: "",
        };
      } else {
        throwIllegal("missing )", state, char);
      }
    },
    star: throwDefaultIllegal,
    other: throwDefaultIllegal,
  },
  A: {
    space: (state) => {},
    newLine: (state) => {},
    at: throwDefaultIllegal,
    equal: throwDefaultIllegal,
    backslash: (state) => {},
    digit: (state) => {},
    alpha: (state) => {},
    semicolon: (state) => {},
    paren: (state) => {},
    star: (state) => {},
    other: throwDefaultIllegal,
  },
  cComp: {
    space: (state) => {},
    newLine: (state) => {},
    at: throwDefaultIllegal,
    equal: throwDefaultIllegal,
    backslash: (state) => {},
    digit: (state) => {},
    alpha: (state) => {},
    semicolon: (state) => {},
    paren: (state) => {},
    star: (state) => {},
    other: throwDefaultIllegal,
  },
  cDestination: {
    space: (state) => {},
    newLine: (state) => {},
    at: throwDefaultIllegal,
    equal: throwDefaultIllegal,
    backslash: (state) => {},
    digit: (state) => {},
    alpha: (state) => {},
    semicolon: (state) => {},
    paren: (state) => {},
    star: (state) => {},
    other: throwDefaultIllegal,
  },
  cJump: {
    space: (state) => {},
    newLine: (state) => {},
    at: throwDefaultIllegal,
    equal: throwDefaultIllegal,
    backslash: (state) => {},
    digit: (state) => {},
    alpha: (state) => {},
    semicolon: (state) => {},
    paren: (state) => {},
    star: (state) => {},
    other: throwDefaultIllegal,
  },
};

export const parse = (state: AssemblerState) => {
  const { line, lines, position, isFinished, result, currentInstruction } =
    state;
  const char = lines[line][position];
  const prevChar = lines[line][position - 1];

  if (isFinished || char === undefined) {
    return {};
  }

  const handlers = HANDLERS[state.currentInstruction.partType];

  if (char === "\n") {
    return handlers.newLine(state, char, prevChar);
  } else if (char.match(/\s/)) {
    return handlers.space(state, char, prevChar);
  } else if (char.match(/\d/)) {
    return handlers.digit(state, char, prevChar);
  } else if (char.match(/[a-zA-Z]/)) {
    return handlers.alpha(state, char, prevChar);
  } else if (char === "/") {
    return handlers.backslash(state, char, prevChar);
  } else if (char === ";") {
    return handlers.semicolon(state, char, prevChar);
  } else if (char === "(" || char === ")") {
    return handlers.paren(state, char, prevChar);
  } else if (char === "*") {
    return handlers.star(state, char, prevChar);
  } else {
    return throwDefaultIllegal(state, char);
  }
};
