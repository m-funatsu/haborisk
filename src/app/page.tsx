import Link from "next/link";

const FEATURES = [
  {
    title: "総合リスクスコア",
    description: "5つの診断軸で人手不足リスクを0〜100で定量化。ゲージチャートで一目瞭然。",
    icon: "gauge",
  },
  {
    title: "キーパーソン分析",
    description: "「この人が辞めたら？」を可視化。属人性の高い業務を特定し、対策を提案。",
    icon: "person",
  },
  {
    title: "人員予測",
    description: "今後12ヶ月の人員推移を予測。いつ・どの部署で何人不足するかを事前把握。",
    icon: "chart",
  },
  {
    title: "業界ベンチマーク",
    description: "同業種の平均離職率・人手不足率と比較。自社のリスクポジションを把握。",
    icon: "benchmark",
  },
  {
    title: "アクションプラン",
    description: "リスクスコアに基づき、採用・DX・研修・外注・承継の具体的施策を自動提案。",
    icon: "action",
  },
] as const;

const STATS = [
  { value: "53.4%", label: "正社員不足企業" },
  { value: "397件", label: "人手不足倒産(2025年)" },
  { value: "16兆円", label: "逸失利益" },
] as const;

function FeatureIcon({ icon }: { icon: string }) {
  const baseClass = "w-10 h-10 rounded-lg flex items-center justify-center text-white text-lg font-bold";
  switch (icon) {
    case "gauge":
      return <div className={`${baseClass} bg-red-500`}>R</div>;
    case "person":
      return <div className={`${baseClass} bg-orange-500`}>K</div>;
    case "chart":
      return <div className={`${baseClass} bg-blue-500`}>P</div>;
    case "benchmark":
      return <div className={`${baseClass} bg-green-500`}>B</div>;
    case "action":
      return <div className={`${baseClass} bg-purple-500`}>A</div>;
    default:
      return null;
  }
}

export default function LandingPage() {
  return (
    <div className="flex flex-col" data-testid="landing-page">
      {/* Hero */}
      <section className="px-6 pt-12 pb-8 bg-gradient-to-b from-blue-50 to-white">
        <div className="mb-2">
          <span className="text-sm font-medium text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
            中小企業向け
          </span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mt-4 leading-tight">
          人手不足リスク
          <br />
          <span className="text-blue-600">診断ダッシュボード</span>
        </h1>
        <p className="mt-4 text-gray-600 text-base leading-relaxed">
          従業員データを入力するだけで、自社の人手不足リスクを定量化。
          年齢構成・キーパーソン依存・離職率・季節変動・事業承継の5軸で診断し、
          具体的な対策を提案します。
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/dashboard"
            className="flex-1 bg-blue-600 text-white text-center py-3 px-4 rounded-xl font-medium hover:bg-blue-700 transition-colors"
            data-testid="cta-dashboard"
          >
            ダッシュボードを見る
          </Link>
          <Link
            href="/employees"
            className="flex-1 bg-white text-blue-600 text-center py-3 px-4 rounded-xl font-medium border border-blue-200 hover:bg-blue-50 transition-colors"
          >
            従業員を登録
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 py-8">
        <h2 className="text-sm font-medium text-gray-500 mb-4">日本の人手不足の現状</h2>
        <div className="grid grid-cols-3 gap-3">
          {STATS.map((stat) => (
            <div
              key={stat.label}
              className="bg-red-50 rounded-xl p-3 text-center border border-red-100"
            >
              <div className="text-xl font-bold text-red-600">{stat.value}</div>
              <div className="text-[11px] text-red-500 mt-1 leading-tight">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="px-6 py-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">主な機能</h2>
        <div className="flex flex-col gap-4">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="flex gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <FeatureIcon icon={feature.icon} />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-8 mb-4">
        <div className="bg-blue-600 rounded-2xl p-6 text-center text-white">
          <h2 className="text-lg font-bold">今すぐリスク診断を始めましょう</h2>
          <p className="text-blue-100 text-sm mt-2">
            デモデータで即座に体験できます
          </p>
          <Link
            href="/dashboard"
            className="inline-block mt-4 bg-white text-blue-600 py-2.5 px-6 rounded-xl font-medium hover:bg-blue-50 transition-colors"
          >
            無料で診断する
          </Link>
        </div>
      </section>
    </div>
  );
}
