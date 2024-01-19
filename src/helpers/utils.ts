
export const printStackTrace = (e: Error): string[] => 
  e.stack?.split("\n").slice(1).map(s => s.replace(/^\s+at\s/, "")) || []

export const arrayIndexer = <T>(indexCallback: (v: T) => number, values: T[]): {[key: number]: T[]} => 
  values.reduce( (actual, cur, i) => Object.assign(actual, { [indexCallback(cur)]: i} ), {} )


