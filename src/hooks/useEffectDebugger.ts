import { IS_DEVELOPMENT } from "./../utils/env";
import * as React from "react";

const usePrevious = (value, initialValue) => {
  const ref = React.useRef(initialValue);
  React.useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const useEffectDebugger = (effectHook, dependencies, dependencyNames = []) => {
  if (!IS_DEVELOPMENT)
    throw new Error(
      "useEffectDebugger only to be used in development. Please revert to using React.useEffect."
    );

  const previousDeps = usePrevious(dependencies, []);

  const changedDeps = dependencies.reduce((accum, dependency, index) => {
    if (dependency !== previousDeps[index]) {
      const keyName = dependencyNames[index] || index;
      return {
        ...accum,
        [keyName]: {
          before: previousDeps[index],
          after: dependency
        }
      };
    }

    return accum;
  }, {});

  if (Object.keys(changedDeps).length) {
    console.log("[use-effect-debugger] ", changedDeps);
  }

  // ignore the react hook warning bc this is only to be used in development
  // eslint-disable-next-line react-hooks/exhaustive-deps
  React.useEffect(effectHook, dependencies);
};

export default useEffectDebugger;
