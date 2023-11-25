export interface AsmSymbol {
  address: number;
}

export interface Instruction {
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
  | "null"
  | "comment"
  | "multilineComment"
  | "A"
  | "label"
  | "cComp"
  | "cDestination"
  | "cJump";

export interface CurrentInstruction {
  partType: InstructionPartType;
  value: string;
}

export interface AssemblerState {
  lines: string[];
  line: number;
  position: number;
  result: AssemblerResult;
  currentInstruction: CurrentInstruction;
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
});

export const createError = (
  message: string,
  state: AssemblerState,
  ErrorType = Error
) => {
  throw new ErrorType(
    `${message} (line ${state.line} position ${state.position})`
  );
};
