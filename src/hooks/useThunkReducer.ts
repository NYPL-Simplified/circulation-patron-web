import * as React from "react";

export default function useThunkReducer<R extends React.Reducer<any, any>, I>(
  reducer: R,
  initializerArg: I & React.ReducerState<R>
): [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>] {
  const [state, dispatch] = React.useReducer(reducer, initializerArg);

  // if the action is a function, call it with dispatch. That's all redux-thunk does.
  // wrap it in useCallback so the identity is stable for perf
  const dispatchWithMiddleware: (
    action: React.ReducerAction<R>
  ) => void = React.useCallback(
    (action: React.ReducerAction<R>) => {
      if (typeof action === "function") {
        return action(dispatchWithMiddleware);
      } else {
        dispatch(action);
      }
    },
    [dispatch]
  );

  return [state, dispatchWithMiddleware];
}
