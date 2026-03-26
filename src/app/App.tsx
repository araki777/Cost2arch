import { useState, useEffect } from 'react';
import ArchitectureDiagram from './components/ArchitectureDiagram';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Card } from './components/ui/card';
import { Sparkles, Zap, Coins, History, ArrowRight, Music, Cloud, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedInfra {
  systemName: string;
  architecture: string[];
  dotCode: string;
  monthlyCost: number;
  comment: string;
}

export default function App() {
  const [oshikatsuAmount, setOshikatsuAmount] = useState('');
  const [activityName, setActivityName] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GeneratedInfra | null>(null);

  const handleGenerate = async () => {
    if (!oshikatsuAmount || !activityName) {
      toast.error('活動内容と金額を入力してください！');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/infra/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseInt(oshikatsuAmount),
          activityName,
        }),
      });

      if (!response.ok) throw new Error('Generation failed');
      const data = await response.json();
      setResult(data);
      toast.success('インフラ構成のビルドに成功しました！');
    } catch (error) {
      console.error(error);
      toast.error('構成の生成に失敗しました。Geminiの機嫌が悪いようです。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dark min-h-screen bg-slate-950 text-slate-50 selection:bg-indigo-500/30 selection:text-white overflow-x-hidden">
      {/* Background with Mrs. GREEN APPLE / Azure colors */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 right-0 h-[600px] w-[600px] rounded-full bg-blue-600/10 blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 left-0 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] grayscale"></div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-12 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-16 space-y-4 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Que Sera Architecture Pro
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-emerald-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
            Que Sera Architecture
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            その推し活予算を、Microsoft Azure® インフラストラクチャに変換。<br className="hidden md:block" />
            「成るようになる（ケセラセラ）」最強のシステム構成を提案します。
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Input Form */}
          <div className="lg:col-span-4 space-y-8 animate-in fade-in slide-in-from-left-4 duration-1000">
            <Card className="p-8 bg-slate-900/40 border-slate-800/50 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-blue-500 via-emerald-500 to-transparent"></div>
              
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                    <Music className="h-5 w-5 text-emerald-400" />
                  </div>
                  <h2 className="text-xl font-black tracking-tight">推し活の記録</h2>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">活動内容</label>
                    <Input 
                      placeholder="例: Mrs. GREEN APPLE ライブ遠征" 
                      value={activityName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setActivityName(e.target.value)}
                      className="bg-slate-950/50 border-slate-800 h-12 focus:ring-emerald-500/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 pl-1">予算 (円)</label>
                    <div className="relative">
                      <Coins className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-600" />
                      <Input 
                        type="number"
                        placeholder="15000" 
                        value={oshikatsuAmount}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOshikatsuAmount(e.target.value)}
                        className="bg-slate-950/50 border-slate-800 h-14 pl-12 text-xl font-bold focus:ring-blue-500/50"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-lg transition-all active:scale-[0.98] shadow-lg shadow-blue-900/20 group"
                  >
                    {loading ? (
                      <Zap className="h-6 w-6 animate-spin" />
                    ) : (
                      <>
                        インフラを構築する
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6 bg-slate-900/40 border-slate-800/50 backdrop-blur-md">
              <div className="space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Resource Consumption</span>
                  <History className="h-4 w-4" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Total Budget</div>
                    <div className="text-xl font-bold tracking-tight">¥{(parseInt(oshikatsuAmount) || 0).toLocaleString()}</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/50 border border-slate-800">
                    <div className="text-xs text-slate-500 mb-1">Region</div>
                    <div className="text-xl font-bold tracking-tight text-blue-400">West US 2</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Results & Diagram */}
          <div className="lg:col-span-8 space-y-8 animate-in fade-in slide-in-from-right-4 duration-1000 delay-200">
            {result ? (
              <div className="space-y-8">
                {/* Result Card */}
                <Card className="p-8 bg-slate-900/60 border-indigo-500/30 shadow-[0_0_50px_rgba(79,70,229,0.1)] relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-slate-800/50 pb-8">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Cloud className="h-4 w-4 text-blue-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Architecture Built</span>
                      </div>
                      <h3 className="text-3xl font-black tracking-tight mb-2">{result.systemName}</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.architecture.map((tech: string, i: number) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-widest border border-slate-700">{tech}</span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Estimated Cost</div>
                      <div className="text-4xl font-black text-emerald-400">¥{result.monthlyCost.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">/ MONTHLY</div>
                    </div>
                  </div>

                  <div className="relative mb-8">
                    <div className="p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-200 italic leading-relaxed text-lg">
                      " {result.comment} "
                    </div>
                  </div>

                  {/* Architecture Visualization */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                       <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Infrastructure Visualization (DOT/SVG)</label>
                       <div className="flex items-center gap-2">
                         <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                         <span className="text-[9px] font-bold text-emerald-500/80 uppercase">Static Render</span>
                       </div>
                    </div>
                    <ArchitectureDiagram dotCode={result.dotCode} loading={loading} />
                  </div>
                </Card>

                {/* Footnote */}
                <div className="flex items-center justify-center gap-6 py-4 opacity-30 grayscale blur-[0.5px]">
                  <ShieldCheck className="h-4 w-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">ANS Certified Architecture • Microsoft Azure® Cost Optimized • Que Sera Optimized</span>
                </div>
              </div>
            ) : (
              <div className="h-full min-h-[600px] flex flex-col items-center justify-center p-12 rounded-3xl bg-slate-900/20 border-2 border-dashed border-slate-800/50 group">
                <div className="relative mb-8">
                   <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full group-hover:scale-150 transition-transform duration-1000"></div>
                   <Cloud className="h-24 w-24 text-slate-800 relative z-10" />
                </div>
                <h4 className="text-2xl font-black mb-4 text-slate-700">準備完了</h4>
                <p className="text-slate-500 text-center max-w-sm leading-relaxed font-medium capitalize">
                  左側のフォームから予算を入力して、<br />
                  インフラ構成を構築してください。
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Legal */}
        <footer className="mt-20 pb-12 text-center select-none">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-700 opacity-40 mb-2">
            Microsoft, Azure, and other Microsoft names and logos are trademarks or registered trademarks of Microsoft Corporation in the United States and/or other countries.
          </p>
          <p className="text-[9px] font-bold text-slate-800 opacity-25">
            Microsoft、Azure、およびその他のマイクロソフトの名称およびロゴは、米国 Microsoft Corporation および/またはその関連会社の商標または登録商標です。
          </p>
        </footer>
      </div>
    </div>
  );
}
