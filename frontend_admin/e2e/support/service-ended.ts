import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

function detectServiceEndedMode(): boolean {
  if (process.env.E2E_SERVICE_ENDED) {
    return /^(1|true)$/i.test(process.env.E2E_SERVICE_ENDED)
  }

  const appPath = fileURLToPath(new URL('../../src/App.tsx', import.meta.url))
  const appSource = readFileSync(appPath, 'utf8')

  return appSource.includes('return <ServiceEnded />')
}

export const SERVICE_ENDED_MODE = detectServiceEndedMode()
export const SERVICE_ENDED_MESSAGE = '本サービスの提供は終了いたしました。'
export const SERVICE_ENDED_THANKS = 'お使いいただきありがとうございました。'
