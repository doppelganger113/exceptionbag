export type BagValue = string | number | boolean | undefined;

export interface Bag {
  [key: string]: BagValue;
}
