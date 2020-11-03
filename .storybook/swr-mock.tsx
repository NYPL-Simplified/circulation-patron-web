

import { AppConfig } from "../src/interfaces";
import { defaultMock } from "../src/test-utils/mockConfig"


let nextSwr = {};
export default function useSWR(key: string | string[], fetcher: () => void, options: Record<string, unknown>) {
  if (key) {
    console.log(`Fetching key: ${key}, with ${fetcher.name} and ${options}`);
  }
  return {
    data: undefined,
    error: undefined,
    revalidate:() =>  console.log("Revalidating"),
    isValidating: false,
    mutate: () => console.log("Mutating"),
    ...nextSwr
  };
}

// the decorator to be used in ./storybook/preview to apply the mock to all stories
export function swrDecorator(story, { parameters }) {
  if (parameters && parameters.swr) {
    nextSwr = parameters.swr;
  }
  return story();  
}