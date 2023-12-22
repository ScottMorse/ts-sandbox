export interface AsmSymbol {
  address: number;
  builtIn?: boolean;
}

export interface Instruction {
  kind: "A" | "C";
  value: number;
  metadata: Record<string, unknown>;
}

type SymbolMap = { [name: string]: AsmSymbol };

export interface AssemblerResult {
  symbols: SymbolMap;
  instructions: Instruction[];
}

export type AssemblyInstructionKind =
  | "null"
  | "nullAwaitingNewLine"
  | "comment"
  | "multilineComment"
  | "A"
  | "label"
  | "C";

/** Not a Hack machine code instruction but a Hack assembly code
 * instruction that may or may not be processed into a machine code.
 *
 * For example, a label reference is an assembly instruction that is not
 * processed into a machine code instruction, while an A instruction
 * is an assembly instruction that is directly translated into a machine
 * code A instruction.
 */
export interface AssemblyInstruction {
  kind: AssemblyInstructionKind;
  value: string;
}

export interface AssemblerState {
  lines: string[];
  line: number;
  position: number;
  result: AssemblerResult;
  currentInstruction: AssemblyInstruction;
  previousInstruction: AssemblyInstruction;
  nextSymbolAddress: number;
  isFinished: boolean;
}

const splitSourceLines = (source: string) =>
  source.replace(/\r\n?/gm, "\n").split("\n");

export const createInitialState = (source: string): AssemblerState => ({
  lines: splitSourceLines(source),
  line: 0,
  position: 0,
  result: {
    symbols: {
      R0: {
        address: 0,
        builtIn: true,
      },
      R1: {
        address: 1,
        builtIn: true,
      },
      R2: {
        address: 2,
        builtIn: true,
      },
      R3: {
        address: 3,
        builtIn: true,
      },
      R4: {
        address: 4,
        builtIn: true,
      },
      R5: {
        address: 5,
        builtIn: true,
      },
      R6: {
        address: 6,
        builtIn: true,
      },
      R7: {
        address: 7,
        builtIn: true,
      },
      R8: {
        address: 8,
        builtIn: true,
      },
      R9: {
        address: 9,
        builtIn: true,
      },
      R10: {
        address: 10,
        builtIn: true,
      },
      R11: {
        address: 11,
        builtIn: true,
      },
      R12: {
        address: 12,
        builtIn: true,
      },
      R13: {
        address: 13,
        builtIn: true,
      },
      R14: {
        address: 14,
        builtIn: true,
      },
      R15: {
        address: 15,
        builtIn: true,
      },
      SCREEN: {
        address: 16384,
        builtIn: true,
      },
      KBD: {
        address: 24576,
        builtIn: true,
      },
      SP: {
        address: 0,
        builtIn: true,
      },
      LCL: {
        address: 1,
        builtIn: true,
      },
      ARG: {
        address: 2,
        builtIn: true,
      },
      THIS: {
        address: 3,
        builtIn: true,
      },
      THAT: {
        address: 4,
        builtIn: true,
      },
    },
    instructions: [],
  },
  nextSymbolAddress: 16,
  currentInstruction: {
    kind: "null",
    value: "",
  },
  previousInstruction: {
    kind: "null",
    value: "",
  },
  isFinished: false,
});

export const createError = (
  message: string,
  state: AssemblerState,
  ErrorType = Error
) => {
  throw new ErrorType(
    `Error: ${message} (line ${state.line + 1} position ${
      state.position
    })\nSource: ${state.lines[state.line]}\n        ${" ".repeat(
      state.position
    )}^`
  );
};
