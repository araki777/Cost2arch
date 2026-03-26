import { useState, useEffect } from 'react';

export default function App() {
  const [oshikatsuAmount, setOshikatsuAmount] = useState('');
  const [infraLevel, setInfraLevel] = useState(0);
  const [availableHours, setAvailableHours] = useState(0);

  // 推し活金額からインフラレベルと稼働可能時間を計算
  useEffect(() => {
    const amount = parseInt(oshikatsuAmount) || 0;
    // 10,000円で1レベル分のインフラが作れる（最大10レベル）
    const level = Math.min(10, Math.floor(amount / 10000));
    setInfraLevel(level);

    // 稼働可能時間 = レベル × 24時間（1日あたり）
    const hours = level * 24;
    setAvailableHours(hours);
  }, [oshikatsuAmount]);

  // 時間を HHH:MM:SS 形式に変換
  const formatTime = (hours: number) => {
    const h = Math.floor(hours).toString().padStart(3, '0');
    const m = ((hours % 1) * 60).toFixed(0).padStart(2, '0');
    const s = '00';
    return `${h}:${m}:${s}`;
  };

  return (
    <div className="dark">
      <div className="size-full min-h-screen bg-background text-foreground relative overflow-hidden">
        {/* Azure アイコンの背景 */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute"
              style={{
                left: `${(i * 17 + 10) % 90}%`,
                top: `${(i * 23 + 15) % 80}%`,
                transform: `rotate(${i * 15}deg)`,
              }}
            >
              <svg width="80" height="80" viewBox="0 0 96 96" fill="none">
                <path
                  d="M70.5 28.5L48 12L25.5 28.5V60L48 76.5L70.5 60V28.5Z"
                  fill="currentColor"
                  fillOpacity="0.3"
                />
                <path
                  d="M48 12L25.5 28.5L48 45L70.5 28.5L48 12Z"
                  fill="currentColor"
                  fillOpacity="0.5"
                />
                <path
                  d="M48 45V76.5L70.5 60V28.5L48 45Z"
                  fill="currentColor"
                  fillOpacity="0.7"
                />
              </svg>
            </div>
          ))}
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 container mx-auto px-6 py-12 max-w-6xl">
          <h1 className="text-center mb-6 text-primary tracking-wide">
            推し活 → Azure 変換シミュレーター
          </h1>
          <p className="text-center text-muted-foreground mb-12 text-lg">
            その推し活予算があれば、こんなシステムが作れます！
          </p>

          {/* 推し活金額入力 */}
          <div className="mb-12">
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg max-w-2xl mx-auto">
              <label className="block mb-6 text-center text-xl">
                💰 月々の推し活予算を入力してください
              </label>
              <div className="relative">
                <span className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground text-2xl">
                  ¥
                </span>
                <input
                  type="number"
                  value={oshikatsuAmount}
                  onChange={(e) => setOshikatsuAmount(e.target.value)}
                  placeholder="50000"
                  className="w-full bg-input-background border-2 border-primary/30 rounded-xl px-16 py-6 text-3xl text-center
                    focus:outline-none focus:ring-4 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div className="mt-6 text-center">
                <div className="text-muted-foreground text-sm">
                  入力金額
                </div>
                <div
                  className="text-primary mt-2"
                  style={{ fontSize: '2rem', fontWeight: 600 }}
                >
                  ¥{parseInt(oshikatsuAmount || '0').toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* 稼働可能時間 - デジタル時計風表示 */}
          <div className="mb-12">
            <div className="bg-card border-2 border-primary/20 rounded-xl p-12 text-center shadow-2xl">
              <h2 className="text-muted-foreground mb-8">月間稼働可能時間</h2>
              <div
                className="font-mono tracking-widest text-primary"
                style={{
                  fontSize: '6rem',
                  fontWeight: 700,
                  textShadow: '0 0 20px currentColor',
                  letterSpacing: '0.1em',
                }}
              >
                {formatTime(availableHours)}
              </div>
              <div className="text-muted-foreground mt-4 tracking-wider">
                HOURS : MINUTES : SECONDS
              </div>
            </div>
          </div>

          {/* インフラ構成レベル表示 */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border border-border rounded-lg p-8 shadow-lg">
              <h2 className="text-center mb-8">
                構築可能な Azure インフラ構成
              </h2>

              {/* レベルメーター */}
              <div className="mb-8">
                <div className="flex items-center gap-4 mb-4">
                  <span className="text-muted-foreground min-w-[2rem]">Lv 0</span>
                  <div className="flex-1 h-8 bg-muted rounded-lg overflow-hidden relative">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-300 transition-all duration-500 ease-out"
                      style={{
                        width: `${(infraLevel / 10) * 100}%`,
                        boxShadow: infraLevel > 0 ? '0 0 20px rgba(59, 130, 246, 0.5)' : 'none',
                      }}
                    />
                    {/* レベルマーカー */}
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((marker) => (
                      <div
                        key={marker}
                        className="absolute top-0 bottom-0 w-0.5 bg-background/50"
                        style={{ left: `${(marker / 10) * 100}%` }}
                      />
                    ))}
                  </div>
                  <span className="text-muted-foreground min-w-[3rem]">Lv 10</span>
                </div>
              </div>

              {/* レベル表示 */}
              <div className="text-center mb-8">
                <div className="inline-block bg-gradient-to-br from-blue-500 to-cyan-400 text-white px-12 py-6 rounded-xl shadow-xl">
                  <div className="text-sm opacity-80 mb-2">インフラレベル</div>
                  <div
                    className="font-mono"
                    style={{ fontSize: '3.5rem', fontWeight: 700, lineHeight: 1 }}
                  >
                    {infraLevel}
                  </div>
                  <div className="text-sm opacity-80 mt-2">/ 10</div>
                </div>
              </div>

              {/* システム構成の説明 */}
              <div className="bg-muted/30 border border-border rounded-lg p-6">
                <div className="text-center mb-4">
                  <strong className="text-lg">このレベルで構築できるシステム</strong>
                </div>
                <div className="text-muted-foreground text-center">
                  {infraLevel === 0 && '予算を入力してください'}
                  {infraLevel === 1 && '🌱 静的Webサイト（App Service Basic）'}
                  {infraLevel === 2 && '🌿 小規模Webアプリ + データベース（SQL Database Basic）'}
                  {infraLevel === 3 && '🪴 Webアプリ + キャッシュ + ストレージ'}
                  {infraLevel === 4 && '🌳 中規模システム + API Management + CDN'}
                  {infraLevel === 5 && '🏗️ マイクロサービス基盤（AKS Small）'}
                  {infraLevel === 6 && '🏭 高可用性システム + Load Balancer + Backup'}
                  {infraLevel === 7 && '🌐 グローバル配信 + Multi-Region構成'}
                  {infraLevel === 8 && '⚡ 高性能AI/ML基盤 + GPU VM + Cognitive Services'}
                  {infraLevel === 9 && '🚀 エンタープライズ級 + セキュリティ強化 + 監視'}
                  {infraLevel === 10 && '🏆 フルスタック構成 + DevOps + DR対策完備'}
                </div>
              </div>
            </div>
          </div>

          {/* 計算式の説明 */}
          <div className="mt-12 bg-muted/30 border border-border rounded-lg p-6">
            <div className="text-muted-foreground text-center space-y-2">
              <div><strong>計算式：</strong></div>
              <div>インフラレベル = 推し活予算 ÷ 10,000円（最大Lv10）</div>
              <div>月間稼働時間 = インフラレベル × 24時間</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
