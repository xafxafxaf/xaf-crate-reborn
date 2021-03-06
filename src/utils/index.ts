export function generateHash(): string {
  return Math.random()
    .toString(36)
    .substring(2, 12)
    .replace(/[0-9]+/i, '')
}

// * https://stackoverflow.com/questions/27936772/how-to-deep-merge-instead-of-shallow-merge
/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function is_object(item) {
  return item && typeof item === 'object' && !Array.isArray(item)
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
export function deep_merge(target, ...sources) {
  if (!sources.length) return target
  const source = sources.shift()

  if (is_object(target) && is_object(source)) {
    for (const key in source) {
      if (is_object(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} })
        deep_merge(target[key], source[key])
      } else {
        Object.assign(target, { [key]: source[key] })
      }
    }
  }

  return deep_merge(target, ...sources)
}
