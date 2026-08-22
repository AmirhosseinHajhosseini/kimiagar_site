"use client";

import { useCallback, useReducer } from "react";

type Updater<T> = T | ((current: T) => T);

interface HistoryState<T> {
  past: T[];
  present: T;
  future: T[];
}

type HistoryAction<T> =
  | {
      type: "UPDATE";
      updater: Updater<T>;
    }
  | {
      type: "UNDO";
    }
  | {
      type: "REDO";
    }
  | {
      type: "RESET";
      value: T;
    };

const MAX_HISTORY_LENGTH = 100;

function historyReducer<T>(
  state: HistoryState<T>,
  action: HistoryAction<T>,
): HistoryState<T> {
  switch (action.type) {
    case "UPDATE": {
      const nextValue =
        typeof action.updater === "function"
          ? (
              action.updater as (
                current: T,
              ) => T
            )(state.present)
          : action.updater;

      if (Object.is(nextValue, state.present)) {
        return state;
      }

      return {
        past: [...state.past, state.present].slice(
          -MAX_HISTORY_LENGTH,
        ),
        present: nextValue,
        future: [],
      };
    }

    case "UNDO": {
      if (state.past.length === 0) {
        return state;
      }

      const previousValue =
        state.past[state.past.length - 1];

      return {
        past: state.past.slice(0, -1),
        present: previousValue,
        future: [
          state.present,
          ...state.future,
        ],
      };
    }

    case "REDO": {
      if (state.future.length === 0) {
        return state;
      }

      const nextValue = state.future[0];

      return {
        past: [...state.past, state.present].slice(
          -MAX_HISTORY_LENGTH,
        ),
        present: nextValue,
        future: state.future.slice(1),
      };
    }

    case "RESET": {
      return {
        past: [],
        present: action.value,
        future: [],
      };
    }

    default: {
      return state;
    }
  }
}

export function useDocumentHistory<T>(
  initialDocument: T,
) {
  const [state, dispatch] = useReducer(
    historyReducer<T>,
    {
      past: [],
      present: initialDocument,
      future: [],
    },
  );

  const updateDocument = useCallback(
    (updater: Updater<T>) => {
      dispatch({
        type: "UPDATE",
        updater,
      });
    },
    [],
  );

  const undo = useCallback(() => {
    dispatch({ type: "UNDO" });
  }, []);

  const redo = useCallback(() => {
    dispatch({ type: "REDO" });
  }, []);

  const resetHistory = useCallback((value: T) => {
    dispatch({
      type: "RESET",
      value,
    });
  }, []);

  return {
    document: state.present,
    updateDocument,
    undo,
    redo,
    resetHistory,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  };
}
