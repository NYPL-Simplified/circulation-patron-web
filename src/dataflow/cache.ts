import { CACHE_EXPIRATION_SECONDS } from "./../utils/env";
import NodeCache from "node-cache";

class Cache {
  cache = new NodeCache({ stdTTL: CACHE_EXPIRATION_SECONDS });

  async get<T>(key: string, fetchFunction: () => Promise<T>): Promise<T> {
    const value = this.cache.get<T>(key);
    if (value) return Promise.resolve(value);

    const result = await fetchFunction();
    this.cache.set<T>(key, result);
    return result;
  }
}

const cache = new Cache();

export default cache;
