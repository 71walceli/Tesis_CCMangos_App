
export const printStackTrace = e => e.stack.split("\n").slice(1).map(s => s.replace(/^\s+at\s/, ""))
