import * as React from "react";
import collection, {
  initialState,
  CollectionState
} from "opds-web-client/lib/reducers/collection";
import useThunkReducer from "../../hooks/useThunkReducer";
import { useActions } from "opds-web-client/lib/components/context/ActionsContext";

/**
 * The recommendations state is somewhat confusing. It is no longer stored
 * in redux, since it proved easier to move it into react context instead
 * of trying to add it as a new reducer to the imported opds redux store.
 * However, it does import the same reducer code as an opds "collection",
 * and will dispatch actions from the opds ActionCreator, but with its own
 * dispatch method.
 *
 * In the future, we should look to unify this all into a single redux
 * implementation, possibly by having opds export its reducers and actions
 * and then letting consuming apps build their own store and add custom
 * reducers as necessary.
 */

export const RecommendationsStateContext = React.createContext<
  CollectionState | undefined
>(undefined);
export const RecommendationsDispatchContext = React.createContext<
  React.Dispatch<any> | undefined
>(undefined);

export const RecommendationsProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useThunkReducer(collection, initialState);

  return (
    <RecommendationsStateContext.Provider value={state}>
      <RecommendationsDispatchContext.Provider value={dispatch}>
        {children}
      </RecommendationsDispatchContext.Provider>
    </RecommendationsStateContext.Provider>
  );
};

function useRecommendationsState() {
  const state = React.useContext(RecommendationsStateContext);
  const dispatch = React.useContext(RecommendationsDispatchContext);
  const { actions } = useActions();

  if (typeof state === "undefined" || typeof dispatch === "undefined") {
    throw new Error(
      "useRecommendationsState must be used within a RecommendationsContextProvider"
    );
  }
  // possibly bind all the actions with dispatch here?
  return {
    recommendationsState: state,
    recommendationsDispatch: dispatch,
    recommendationsActions: actions
  };
}

export default useRecommendationsState;
