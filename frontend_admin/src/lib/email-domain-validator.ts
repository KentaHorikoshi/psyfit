/**
 * メールアドレスのドメイン部分のタイポを検知し、正しいドメインを提案するユーティリティ
 */

/** 日本で一般的なメールドメイン一覧 */
const KNOWN_DOMAINS = [
  // Google
  'gmail.com',
  'googlemail.com',
  // Yahoo
  'yahoo.co.jp',
  'yahoo.com',
  'ymail.com',
  // Microsoft
  'hotmail.com',
  'hotmail.co.jp',
  'outlook.com',
  'outlook.jp',
  'live.jp',
  'live.com',
  // Apple
  'icloud.com',
  'me.com',
  'mac.com',
  // 携帯キャリア
  'docomo.ne.jp',
  'ezweb.ne.jp',
  'softbank.ne.jp',
  'au.com',
  'i.softbank.jp',
  // その他
  'aol.com',
  'protonmail.com',
  'zoho.com',
] as const

/**
 * 2つの文字列間のLevenshtein距離を計算する
 * 早期打ち切り: maxDistance を超えた時点で計算を中断
 */
export function levenshteinDistance(a: string, b: string, maxDistance = 3): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  // 長さの差がmaxDistanceを超える場合は早期リターン
  if (Math.abs(a.length - b.length) > maxDistance) return maxDistance + 1

  // (a.length+1) x (b.length+1) の行列を初期化
  const rows = a.length + 1
  const cols = b.length + 1
  const matrix: number[] = new Array(rows * cols)

  for (let i = 0; i < rows; i++) matrix[i * cols] = i
  for (let j = 0; j < cols; j++) matrix[j] = j

  for (let i = 1; i < rows; i++) {
    let rowMin = Infinity
    for (let j = 1; j < cols; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      const del = matrix[(i - 1) * cols + j]!
      const ins = matrix[i * cols + (j - 1)]!
      const sub = matrix[(i - 1) * cols + (j - 1)]!
      const val = Math.min(del + 1, ins + 1, sub + cost)
      matrix[i * cols + j] = val
      rowMin = Math.min(rowMin, val)
    }
    // 行の最小値がmaxDistanceを超えたら早期打ち切り
    if (rowMin > maxDistance) return maxDistance + 1
  }

  return matrix[a.length * cols + b.length]!
}

/**
 * メールアドレスのドメイン部分を検査し、タイポの可能性がある場合に正しいドメインを提案する
 *
 * @param email - 検査するメールアドレス
 * @returns 提案するドメイン（タイポがない場合は null）
 *
 * @example
 * suggestDomain('user@gmial.com')  // 'gmail.com'
 * suggestDomain('user@gmail.com')  // null (正しい)
 * suggestDomain('user@company.jp') // null (未知ドメイン)
 */
export function suggestDomain(email: string): string | null {
  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1 || atIndex === email.length - 1) return null

  const domain = email.slice(atIndex + 1).toLowerCase().trim()
  if (domain.length === 0) return null

  // 完全一致するドメインがあれば提案不要
  if (KNOWN_DOMAINS.includes(domain as (typeof KNOWN_DOMAINS)[number])) return null

  let bestMatch: string | null = null
  let bestDistance = Infinity

  for (const knownDomain of KNOWN_DOMAINS) {
    const distance = levenshteinDistance(domain, knownDomain, 2)
    if (distance > 0 && distance <= 2 && distance < bestDistance) {
      bestDistance = distance
      bestMatch = knownDomain
    }
  }

  return bestMatch
}

/**
 * メールアドレスのドメイン部分を提案されたドメインに置換する
 */
export function applyDomainSuggestion(email: string, suggestedDomain: string): string {
  const atIndex = email.lastIndexOf('@')
  if (atIndex === -1) return email
  return email.slice(0, atIndex + 1) + suggestedDomain
}
