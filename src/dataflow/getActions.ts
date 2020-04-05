import DataFetcher from "opds-web-client/lib/DataFetcher";
import ActionsCreator from "opds-web-client/lib/actions";
import { adapter } from "opds-web-client/lib/OPDSDataAdapter";

export default function getActions() {
  const fetcher = new DataFetcher({ adapter });
  const actions = new ActionsCreator(fetcher);

  return { actions, fetcher };
}
