// NOTE: サービス終了につき、全ルーティングを ServiceEnded に差し替え済み。
// 元の実装（Router + Routes）は git 履歴から復元可能。
// 復帰手順は CLAUDE.md の「サービス終了メッセージからの復帰手順」を参照。
import { ServiceEnded } from './components/ServiceEnded'

export default function App() {
  return <ServiceEnded />
}
