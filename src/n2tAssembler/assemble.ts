import { createStore } from "zustand/vanilla";
import { immer } from "zustand/middleware/immer";
import { AssemblerState, createInitialState } from "./state";
import { parse } from "./parse";

const incrementPosition = (state: AssemblerState) => {
  if (state.isFinished) {
    console.warn("Assembler is finished, cannot increment position");
    return state;
  }

  if (state.position >= state.lines[state.line].length - 1) {
    if (state.line === state.lines.length - 1) {
      state.isFinished = true;
    } else {
      state.line = state.line + 1;
      state.position = 0;
    }
  } else {
    state.position = state.position + 1;
  }
};

export const assemble = (source: string): AssemblerState["result"] => {
  interface AssemblerStoreState extends AssemblerState {
    incrementPosition: () => void;
    parseNext: () => void;
  }

  const store = createStore<AssemblerStoreState>()(
    immer((set) => ({
      ...createInitialState(source),
      incrementPosition: () => set((state) => incrementPosition(state)),
      parseNext: () => set((state) => parse(state)),
    }))
  );

  const expectedLoopCount = store
    .getState()
    .lines.reduce((count, line) => count + Math.max(line.length || 1), 1);

  let loopCount = 0;
  let isFinished = false;
  while (!isFinished) {
    if (loopCount > expectedLoopCount) {
      throw new Error(
        `Loop count exceeded expected loop count ${expectedLoopCount}`
      );
    }

    const { incrementPosition, parseNext } = store.getState();

    incrementPosition();

    parseNext();

    isFinished = store.getState().isFinished;

    loopCount++;
  }

  return store.getState().result;
};
