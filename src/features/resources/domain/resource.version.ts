export function hasResourceVersionChanged(
  baseUpdatedAt: string | undefined,
  latestUpdatedAt: string | undefined,
): boolean {
  return Boolean(baseUpdatedAt && latestUpdatedAt && baseUpdatedAt !== latestUpdatedAt)
}
