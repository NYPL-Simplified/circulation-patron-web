import { responseInterface } from "swr";

export function makeSwrResponse<T>(value?: Partial<responseInterface<T, any>>) {
  return {
    data: undefined,
    error: undefined,
    revalidate: jest.fn(),
    isValidating: false,
    mutate: jest.fn(),
    ...value
  };
}

export type MockSwr<T> = (value?: Partial<responseInterface<T, any>>) => void;
