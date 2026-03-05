import type { ActionItem } from "@/types";

type DimensionKey = "age" | "keyPerson" | "turnover" | "seasonal" | "succession";

interface RecommendationTemplate {
  dimension: DimensionKey;
  threshold: number;
  items: Omit<ActionItem, "id" | "status">[];
}

export const RECOMMENDATION_TEMPLATES: RecommendationTemplate[] = [
  {
    dimension: "age",
    threshold: 60,
    items: [
      {
        title: "若手採用強化プログラム",
        description:
          "20代〜30代前半の人材を積極的に採用するための施策を実施します。新卒採用の強化、インターンシップの導入、SNSを活用した採用広報を行います。",
        category: "hiring",
        priority: "urgent",
        estimatedCost: "月額20〜50万円",
        estimatedTimeline: "3〜6ヶ月",
      },
      {
        title: "シニア人材の活用延長制度",
        description:
          "定年延長・再雇用制度を整備し、経験豊富なシニア社員の活用期間を延長します。同時にナレッジトランスファーの仕組みを構築します。",
        category: "training",
        priority: "high",
        estimatedCost: "制度設計50万円＋運用費",
        estimatedTimeline: "6〜12ヶ月",
      },
    ],
  },
  {
    dimension: "age",
    threshold: 40,
    items: [
      {
        title: "年齢構成バランス改善",
        description:
          "中長期的な採用計画を策定し、年齢構成のバランスを改善します。中途採用と新卒採用を組み合わせた計画的な人材確保を行います。",
        category: "hiring",
        priority: "medium",
        estimatedCost: "月額10〜30万円",
        estimatedTimeline: "6〜12ヶ月",
      },
    ],
  },
  {
    dimension: "keyPerson",
    threshold: 60,
    items: [
      {
        title: "業務マニュアル化・標準化",
        description:
          "キーパーソンが担当する業務を文書化し、標準作業手順書（SOP）を作成します。属人化を解消し、誰でも業務を遂行できる体制を構築します。",
        category: "dx",
        priority: "urgent",
        estimatedCost: "50〜100万円",
        estimatedTimeline: "3〜6ヶ月",
      },
      {
        title: "クロストレーニング実施",
        description:
          "キーパーソンのスキルを他の社員に移転するための計画的なクロストレーニングを実施します。最低2名がバックアップできる体制を目指します。",
        category: "training",
        priority: "urgent",
        estimatedCost: "月額10〜20万円",
        estimatedTimeline: "3〜6ヶ月",
      },
    ],
  },
  {
    dimension: "keyPerson",
    threshold: 40,
    items: [
      {
        title: "ナレッジ共有の仕組み構築",
        description:
          "社内Wikiやナレッジベースを導入し、業務知識の共有を促進します。定期的な勉強会やペアワークを通じて知識の分散を図ります。",
        category: "dx",
        priority: "high",
        estimatedCost: "月額5〜10万円",
        estimatedTimeline: "1〜3ヶ月",
      },
    ],
  },
  {
    dimension: "turnover",
    threshold: 60,
    items: [
      {
        title: "従業員エンゲージメント強化",
        description:
          "定期的な1on1面談、従業員満足度調査の実施、職場環境の改善を通じて離職率の低減を図ります。柔軟な働き方の導入も検討します。",
        category: "training",
        priority: "urgent",
        estimatedCost: "月額10〜30万円",
        estimatedTimeline: "3〜6ヶ月",
      },
      {
        title: "報酬・福利厚生の見直し",
        description:
          "業界水準との比較分析を行い、競争力のある報酬体系と福利厚生制度を整備します。成果に応じたインセンティブ制度も検討します。",
        category: "hiring",
        priority: "high",
        estimatedCost: "年間100〜300万円増",
        estimatedTimeline: "1〜3ヶ月",
      },
    ],
  },
  {
    dimension: "turnover",
    threshold: 40,
    items: [
      {
        title: "キャリアパス制度の整備",
        description:
          "社員の成長意欲に応えるキャリアパス制度を整備します。スキルアップ支援、資格取得補助、昇進基準の明確化を行います。",
        category: "training",
        priority: "medium",
        estimatedCost: "年間50〜100万円",
        estimatedTimeline: "3〜6ヶ月",
      },
    ],
  },
  {
    dimension: "seasonal",
    threshold: 60,
    items: [
      {
        title: "業務のDX化・自動化推進",
        description:
          "非正規雇用への依存を減らすため、RPA・AIツールの導入により定型業務を自動化します。繁忙期の業務負荷を平準化します。",
        category: "dx",
        priority: "high",
        estimatedCost: "100〜300万円",
        estimatedTimeline: "3〜6ヶ月",
      },
      {
        title: "外部リソースの戦略的活用",
        description:
          "アウトソーシングや業務委託を活用して、季節変動に柔軟に対応できる体制を構築します。BPOサービスの導入を検討します。",
        category: "outsourcing",
        priority: "high",
        estimatedCost: "月額20〜50万円",
        estimatedTimeline: "1〜3ヶ月",
      },
    ],
  },
  {
    dimension: "seasonal",
    threshold: 40,
    items: [
      {
        title: "正社員比率の改善計画",
        description:
          "パート・契約社員の正社員転換制度を整備し、雇用の安定化を図ります。助成金の活用も検討します。",
        category: "hiring",
        priority: "medium",
        estimatedCost: "人件費増加分",
        estimatedTimeline: "6〜12ヶ月",
      },
    ],
  },
  {
    dimension: "succession",
    threshold: 60,
    items: [
      {
        title: "事業承継計画の策定",
        description:
          "後継者の選定・育成計画を策定します。外部専門家（事業承継コンサルタント、税理士等）の支援を受けて、計画的な承継を推進します。",
        category: "succession",
        priority: "urgent",
        estimatedCost: "100〜500万円",
        estimatedTimeline: "12〜36ヶ月",
      },
      {
        title: "M&A・第三者承継の検討",
        description:
          "親族内・社内に後継者がいない場合、M&Aや第三者承継の選択肢を検討します。事業引継ぎ支援センターへの相談も推奨します。",
        category: "succession",
        priority: "high",
        estimatedCost: "仲介手数料100〜500万円",
        estimatedTimeline: "12〜24ヶ月",
      },
    ],
  },
  {
    dimension: "succession",
    threshold: 40,
    items: [
      {
        title: "次世代リーダー育成プログラム",
        description:
          "将来の経営幹部候補を育成するプログラムを実施します。外部研修、ジョブローテーション、経営課題プロジェクトへの参画を通じてリーダーシップを開発します。",
        category: "training",
        priority: "medium",
        estimatedCost: "年間50〜150万円",
        estimatedTimeline: "12〜24ヶ月",
      },
    ],
  },
];

export function getRecommendationsForDimension(
  dimension: DimensionKey,
  score: number
): Omit<ActionItem, "id" | "status">[] {
  return RECOMMENDATION_TEMPLATES.filter(
    (t) => t.dimension === dimension && score >= t.threshold
  ).flatMap((t) => t.items);
}
