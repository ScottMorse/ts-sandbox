import { create } from "lodash";
import { curry } from "../lib/curry";
import { createLogger } from "./logger";
import { AssemblerState, AssemblyInstructionKind, createError } from "./state";

type StateChanger = (
  state: AssemblerState,
  char: string,
  prevChar: string | undefined,
  nextChar: string | undefined
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

const detectComment: StateChanger = (state, char, prevChar, nextChar) => {
  if (
    (char === "/" && nextChar === "/") ||
    (char === "/" && prevChar === "/")
  ) {
    state.currentInstruction = {
      kind: "comment",
      value: "",
    };
  } else {
    throwDefaultIllegal(state, char);
  }
};

const finalizeInstruction = (
  state: AssemblerState,
  newLineRequired: boolean
) => {
  state.currentInstruction = {
    kind: newLineRequired ? "nullAwaitingNewLine" : "null",
    value: "",
  };

  state.previousInstruction = {
    kind: "null",
    value: "",
  };
};

const addToInstructionValue = (state: AssemblerState, char: string) => {
  state.currentInstruction.value += char;
};

const createAInstruction = (state: AssemblerState, value: string) => {
  if (value.match(/^\d+$/)) {
    state.result.instructions.push({
      kind: "A",
      value: parseInt(value, 10),
      metadata: {},
    });
  } else {
    if (state.result.symbols[value]) {
      state.result.instructions.push({
        kind: "A",
        value: state.result.symbols[value].address,
        metadata: {
          symbol: value,
          initial: false,
        },
      });
    } else {
      const address = state.nextSymbolAddress;
      state.nextSymbolAddress++;

      state.result.instructions.push({
        kind: "A",
        value: address,
        metadata: {
          symbol: value,
          initial: true,
        },
      });
    }
  }
};

const C_PATTERN = /((?<destination>[ADM]+)(=(?<operandA>-?1|[ADM0])((?<operator>[+-])(?<operandB>[ADM01]))?)|(?<loneComp>[ADM01]{1}))(;(?<jump>J(GT|GE|LT|LE|NE|EQ|MP)))?/
const createCInstruction = (state: AssemblerState, value: string) => {
  const match = value.match(C_PATTERN)

  if(!match){
    throw new Error(`Invalid C instruction at line ${state.line + 1}:\n${value}`)
  }

  const {
    loneComp,
    destination,
    operandA,
    operandB,
    operator,
    jump
  } = match.groups as {
    loneComp?: string
    destination?: string
    operandA?: string
    operandB?: string
    operator?: string
    jump?: string
  }

  if(loneComp){
    
  }
};

const HANDLERS: Record<
  AssemblyInstructionKind,
  Record<
    | "space"
    | "newLine"
    | "backslash"
    | "at"
    | "equal"
    | "operator"
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
        kind: "A",
        value: "",
      };
    },
    backslash: detectComment,
    equal: throwDefaultIllegal,
    operator: throwDefaultIllegal,
    digit: (state, char) => {
      if (["0", "1"].includes(char)) {
        state.currentInstruction = {
          kind: "C",
          value: char,
        };
      } else {
        throwDefaultIllegal(state, char);
      }
    },
    alpha: (state, char) => {
      if (["A", "M", "D"].includes(char)) {
        state.currentInstruction = {
          kind: "C",
          value: state.currentInstruction.value + char,
        };
      }
    },
    semicolon: throwDefaultIllegal,
    paren: (state) => {
      state.currentInstruction = {
        kind: "label",
        value: "",
      };
    },
    star: (state, _char, prevChar) => {
      if (prevChar === "/") {
        state.currentInstruction = {
          kind: "multilineComment",
          value: "",
        };
      }
    },
    other: throwDefaultIllegal,
  },
  nullAwaitingNewLine: {
    space: doNothing,
    newLine: (state) => {
      state.currentInstruction = {
        kind: "null",
        value: "",
      };
    },
    at: throwDefaultIllegal,
    backslash: detectComment,
    equal: throwDefaultIllegal,
    operator: throwDefaultIllegal,
    digit: throwDefaultIllegal,
    alpha: throwDefaultIllegal,
    semicolon: throwDefaultIllegal,
    paren: throwDefaultIllegal,
    star: throwDefaultIllegal,
    other: throwDefaultIllegal,
  },
  comment: {
    space: addToInstructionValue,
    newLine: (state) => {
      if (state.currentInstruction.kind === "comment") {
        finalizeInstruction(
          state,
          state.previousInstruction.kind === "nullAwaitingNewLine"
        );
      }
    },
    at: addToInstructionValue,
    equal: addToInstructionValue,
    operator: addToInstructionValue,
    backslash: addToInstructionValue,
    digit: addToInstructionValue,
    alpha: addToInstructionValue,
    semicolon: addToInstructionValue,
    paren: addToInstructionValue,
    star: addToInstructionValue,
    other: addToInstructionValue,
  },
  multilineComment: {
    space: addToInstructionValue,
    newLine: addToInstructionValue,
    at: addToInstructionValue,
    backslash: (state, _char, prevChar) => {
      if (prevChar === "*") {
        finalizeInstruction(
          state,
          state.previousInstruction.kind === "nullAwaitingNewLine" &&
            !state.currentInstruction.value.includes("\n")
        );
      }
    },
    equal: addToInstructionValue,
    digit: addToInstructionValue,
    operator: addToInstructionValue,
    alpha: addToInstructionValue,
    semicolon: addToInstructionValue,
    paren: addToInstructionValue,
    star: addToInstructionValue,
    other: addToInstructionValue,
  },
  label: {
    space: doNothing,
    at: throwDefaultIllegal,
    newLine: throwIllegal("Unterminated label"),
    backslash: throwIllegal("Unterminated label"),
    digit: (state, char) => {
      if (state.currentInstruction.value.length === 0) {
        throwIllegal("label cannot start with number", state, "digit");
      }
      addToInstructionValue(state, char);
    },
    alpha: addToInstructionValue,
    semicolon: throwDefaultIllegal,
    operator: throwDefaultIllegal,
    equal: throwDefaultIllegal,
    paren: (state, char) => {
      if (char === ")") {
        const label = state.currentInstruction.value.trim();
        if (state.result.symbols[label]) {
          throwIllegal(
            (state.result.symbols[label].builtIn
              ? "Cannot redefine built-in label "
              : "Duplicate label ") + label,
            state,
            char
          );
        } else {
          state.result.symbols[label] = {
            address: state.result.instructions.length,
          };
        }

        state.currentInstruction = {
          kind: "nullAwaitingNewLine",
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
    space: (state, char) => {
      if (!state.currentInstruction.value) {
        return;
      }

      createAInstruction(state, state.currentInstruction.value);
      finalizeInstruction(state, false);
    },
    newLine: (state) => {
      if (!state.currentInstruction.value) {
        throwIllegal("Empty A instruction", state, "\n");
      }

      createAInstruction(state, state.currentInstruction.value);
      finalizeInstruction(state, false);
    },
    at: throwDefaultIllegal,
    equal: throwDefaultIllegal,
    operator: throwDefaultIllegal,
    backslash: detectComment,
    digit: (state, char) => {
      if (!state.currentInstruction.value) {
        throwIllegal("Symbol cannot start with number", state, char);
      }
      state.currentInstruction.value += char;
    },
    alpha: (state, char) => {
      state.currentInstruction.value += char;
    },
    semicolon: throwDefaultIllegal,
    paren: throwDefaultIllegal,
    star: throwDefaultIllegal,
    other: throwDefaultIllegal,
  },
  C: {
    space: doNothing,
    newLine: (state) => {
      createCInstruction(state, state.currentInstruction.value);

      finalizeInstruction(state, false);
    },
    at: throwDefaultIllegal,
    equal: throwDefaultIllegal,
    operator: (state, char, prevChar, nextChar) => {
      if(!)

      if (!state.currentInstruction.value) {
        if(nextChar === '1'){
          state.currentInstruction.value += char
          return
        } else {
          throwDefaultIllegal(state, char);
        }
      }

      if (!state.currentInstruction.value.includes("=")) {
        throwDefaultIllegal(state, char);
      }

      if (state.currentInstruction.value.match(/\+|-/g)) {
        throwDefaultIllegal(state, char);
      }

      if (!state.currentInstruction.value.match(/[ADM01]$/g)) {
        throwDefaultIllegal(state, char);
      }

      state.currentInstruction.value += char;
    },
    backslash: (state, char, prevChar, nextChar) => {
      detectComment(state, char, prevChar, nextChar);

      createCInstruction(state, state.currentInstruction.value);

      finalizeInstruction(state, true);
    },
    digit: (state, char, prevChar) => {
      if (!char.match(/[01]/g)) {
        throwDefaultIllegal(state, char);
      }

      if(prevChar === '-'){
        state.currentInstruction.value += char
        return
      }

      if (!state.currentInstruction.value.match(/=([ADM01][+-])?|^$/g)) {
        throwDefaultIllegal(state, char);
      }

      state.currentInstruction.value += char;
    },
    alpha: (state, char) => {
      if (!char.match(/[ADMJGETL]/g)) {
        throwDefaultIllegal(state, char);
      }

      if (char.match(/[ADM]+$/g)) {
        if (state.currentInstruction.value.match(/[ADM]+$/g)) {
          if (state.currentInstruction.value.includes(char)) {
            throwDefaultIllegal(state, char);
          }
          state.currentInstruction.value += char;
          return;
        }

        if (!state.currentInstruction.value.match(/[=+-]$/g)) {
          throwDefaultIllegal(state, char);
        }

        state.currentInstruction.value += char;

        return;
      }

      if (char.match(/[JGETL]+$/g)) {
        if (!state.currentInstruction.value.match(/;[JGETL]*$/g)) {
          throwDefaultIllegal(state, char);
        }

        state.currentInstruction.value += char;

        return;
      }
    },
    semicolon: (state, char) => {
      if (
        !state.currentInstruction.value.match(
          /[01ADM]$|[ADM]+=[ADM01]([+-][ADM01])?/
        )
      ) {
        throwDefaultIllegal(state, char);
      }
    },
    paren: throwDefaultIllegal,
    star: throwDefaultIllegal,
    other: throwDefaultIllegal,
  },
};

export const parse = (state: AssemblerState) => {
  const { line, lines, position, isFinished, result, currentInstruction } =
    state;
  const char = lines[line][position];
  const prevChar = lines[line][position - 1];
  const nextChar = lines[line][position + 1];

  const handlers = HANDLERS[state.currentInstruction.kind];

  if (isFinished || char === undefined) {
    return handlers.newLine(state, char, prevChar, nextChar);
  }

  createLogger("instruction type", "silent").debug(
    `Current instruction type ${state.currentInstruction.kind}`
  );

  const logger = createLogger("handler", "silent");

  if (char === "\n") {
    logger.debug({ kind: "new line", char });
    return handlers.newLine(state, char, prevChar, nextChar);
  } else if (char === "@") {
    logger.debug({ kind: "at", char });
    return handlers.at(state, char, prevChar, nextChar);
  } else if (char === "=") {
    logger.debug({ kind: "equal", char });
    return handlers.equal(state, char, prevChar, nextChar);
  } else if (char === "+" || char === "-") {
    logger.debug({ kind: "operator", char });
    return handlers.operator(state, char, prevChar, nextChar);
  } else if (char.match(/\s/)) {
    logger.debug({ kind: "space", char });
    return handlers.space(state, char, prevChar, nextChar);
  } else if (char.match(/\d/)) {
    logger.debug({ kind: "digit", char });
    return handlers.digit(state, char, prevChar, nextChar);
  } else if (char.match(/[a-zA-Z]/)) {
    logger.debug({ kind: "alpha", char });
    return handlers.alpha(state, char, prevChar, nextChar);
  } else if (char === "/") {
    logger.debug({ kind: "backslash", char });
    return handlers.backslash(state, char, prevChar, nextChar);
  } else if (char === ";") {
    logger.debug({ kind: "semicolon", char });
    return handlers.semicolon(state, char, prevChar, nextChar);
  } else if (char === "(" || char === ")") {
    logger.debug({ kind: "paren", char });
    return handlers.paren(state, char, prevChar, nextChar);
  } else if (char === "*") {
    logger.debug({ kind: "star", char });
    return handlers.star(state, char, prevChar, nextChar);
  } else {
    logger.debug({ kind: "other", char });
    return handlers.other(state, char, prevChar, nextChar);
  }
};
