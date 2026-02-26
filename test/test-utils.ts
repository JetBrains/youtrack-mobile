export function defined<T>(value: T | undefined): T {
  expect(value).toBeDefined();

  if (value === undefined) {
    throw new Error('Expected value to be defined');
  }
  return value;
}
