import { AnyBook, CollectionData } from "interfaces";
import { mutate } from "swr";

/**
 * This manages updating the SWR data cache programatically, which is sometimes desired.
 */

export async function cacheCollectionBooks(
  collection: CollectionData | undefined
) {
  if (!collection) return;
  await cacheBooks(collection.books);
  await Promise.all(
    collection.lanes.map(lane => {
      return cacheBooks(lane.books);
    })
  );
}

async function cacheBooks(books: AnyBook[]) {
  books.forEach(book => {
    mutate(book.url, book, false);
  });
}
