/** URL/path 세그먼트가 양의 정수 ID인지 */
export function isPositiveIntId(value: string): boolean {
  if (!/^\d+$/.test(value)) return false;
  const n = Number(value);
  return Number.isInteger(n) && n >= 1;
}
