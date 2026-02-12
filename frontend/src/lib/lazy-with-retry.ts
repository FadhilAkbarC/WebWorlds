export type Importer<T> = () => Promise<T>;

export const lazyWithRetry = <T>(importer: Importer<T>, retries = 2, delay = 300): Importer<T> => {
  return () =>
    importer().catch((error) => {
      if (retries <= 0) {
        throw error;
      }
      return new Promise<T>((resolve) =>
        setTimeout(() => resolve(lazyWithRetry(importer, retries - 1, delay * 2)()), delay)
      );
    });
};
