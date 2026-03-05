# HaboRisk (人手不足リスク) - 人手不足リスク診断ダッシュボード

## 概要

HaboRiskは、日本の中小企業が直面する深刻な人手不足リスクを可視化・定量化し、倒産リスクを未然に防ぐための診断ダッシュボードツールである。2024年度の企業倒産件数は10,144件と11年ぶりに10,000件を超え、2025年も2年連続で10,000件を突破した。このうち人手不足を起因とする倒産は2025年に過去最高の397件（前年比36%増）に達している。

日本では正社員が「不足」と回答した企業の割合が53.4%（2025年1月時点）に上り、コロナ禍以降で最も高い水準となっている。特に建設業（99件）、物流業（46件）、飲食サービス業（16件）で人手不足倒産が顕著である。人手不足に関連する逸失利益は2024年に16兆円に達し、パンデミック前（2019年）の4倍に拡大している。

しかし、多くの中小企業は「なんとなく人が足りない」という感覚的な認識にとどまり、自社の人手不足リスクを定量的に把握できていない。HaboRiskは、従業員の年齢構成、キーパーソン依存度、季節変動パターン、離職率推移などのデータをもとに、独自のリスクスコアを算出する。経営者が「いつ、どの部署で、どのようなリスクが顕在化するか」を事前に把握し、採用計画やDX投資、事業承継の意思決定を支援する。

## 推奨ランク: A

人手不足は日本経済の構造的課題であり、今後10年以上にわたって深刻化が確実視される。ただし、リスク診断ツールは「あったら便利」の位置づけであり、PeppolReadyのような規制による強制力はないため、A評価とする。マーケティング次第でS評価に近い市場開拓が可能。

## 問題と解決策

### 課題
- **リスクの見える化ができない**: 多くの中小企業は従業員の年齢構成や退職予測を分析するツールを持っておらず、人手不足リスクを感覚的にしか把握できていない
- **キーパーソン依存**: 特定の熟練社員に業務が集中しており、その社員が退職・病気になった場合の事業継続リスクが極めて高い
- **採用計画の根拠がない**: いつ何人採用すべきかを定量的に判断する材料がなく、「足りなくなってから急いで採用」の後手対応になっている
- **高額なHRツール**: 大企業向けのHRAnalyticsツール（HRBrain、SmartHR等）は月額数万円〜数十万円と中小企業には高額
- **事業承継の準備不足**: 経営者の高齢化が進む中、後継者育成や技術伝承の計画がないまま事業承継の時期を迎えてしまう

### 解決策
- **リスクスコアダッシュボード**: 従業員データを入力するだけで、総合リスクスコア（0〜100）と部署別・リスク要因別の詳細スコアを自動算出。視覚的でわかりやすいダッシュボードで表示
- **キーパーソン分析**: 各業務・スキルの属人性を評価し、「この人が辞めたら事業にどの程度の影響があるか」を定量化。マニュアル化・多能工化の優先順位を提示
- **予測型採用計画**: 従業員の年齢構成、業界平均離職率、季節変動データをもとに、「3ヶ月後・6ヶ月後・1年後にどの部署で何人不足するか」を予測
- **低価格提供**: 月額$9.99（約1,500円）からの料金設定で、5人未満の事業者でも導入可能
- **承継リスク評価**: 経営者・幹部の年齢、後継者の有無、技術伝承状況を評価し、事業承継の準備度スコアを算出

## ターゲットユーザー
- **プライマリ**: 従業員5〜50名の中小企業経営者・人事担当者。特に建設業、製造業、物流業、飲食サービス業など人手不足が深刻な業種
- **セカンダリ**: 中小企業診断士、社会保険労務士（顧問先企業への提案ツールとして）、地域の商工会議所・産業振興センター
- **市場規模**: 従業員5〜50名の中小企業は約100万社。うち人手不足を課題とする企業（53.4%）は約53万社。SOM（初年度目標）は3,000社、ARPUは$12/月として年間売上$432K（約6,500万円）

## 主要機能

1. **総合リスクスコアダッシュボード**
   従業員の年齢構成、離職率、キーパーソン依存度、季節変動、業界平均比較の5つの軸で総合リスクスコア（0〜100）を算出。ゲージチャート、レーダーチャート、トレンドグラフで視覚的に表示。スコアに基づくアラート（赤・黄・緑）で即座にリスクレベルを把握できる。

2. **キーパーソン依存度分析**
   各従業員が担当する業務・スキルをマトリクス表示。「この人しかできない業務」を特定し、属人性スコアを算出。業務マニュアル化の優先度リスト、クロストレーニング計画の提案を自動生成する。

3. **予測型人員計画ツール**
   過去の離職データ、業界平均離職率、従業員年齢分布をもとに、今後12ヶ月の人員推移を予測。月別・部署別の人員過不足をグラフ表示。採用開始の推奨時期と必要人数を提示する。

4. **業界ベンチマーク比較**
   同業種・同規模企業との比較により、自社の人手不足リスクの相対的なポジションを把握。帝国データバンクや東京商工リサーチなどの公開統計データをもとに、業界平均との乖離を表示する。

5. **アクションプラン生成**
   リスクスコアに基づき、優先度の高い施策を自動提案。「DX投資で省力化」「採用チャネルの多様化」「外国人材活用」「業務委託・アウトソーシング」など、具体的なアクションアイテムとコスト概算を提示する。

## 技術スタック
- **Frontend**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Supabase (Auth, Database, Edge Functions)
- **Payment**: Stripe（サブスクリプション管理）
- **Hosting**: Vercel
- **チャート**: Recharts / Chart.js（ダッシュボード可視化）
- **AI**: OpenAI GPT-4o（アクションプラン生成、リスク解説）
- **データソース**: e-Stat API（政府統計）、厚生労働省公開データ
- **分析**: PostHog
- **メール**: Resend

## データモデル

```sql
-- 組織・ユーザー
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  industry_code TEXT NOT NULL, -- 日本標準産業分類コード
  industry_name TEXT NOT NULL,
  prefecture TEXT,
  city TEXT,
  founded_year INTEGER,
  ceo_age INTEGER,
  plan TEXT DEFAULT 'free', -- 'free', 'pro', 'business'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  organization_id UUID REFERENCES organizations(id),
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 従業員データ
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  employee_code TEXT, -- 社員番号（任意）
  department TEXT,
  position TEXT,
  employment_type TEXT, -- 'full_time', 'part_time', 'contract', 'dispatch'
  birth_year INTEGER,
  hire_date DATE,
  is_key_person BOOLEAN DEFAULT FALSE,
  resignation_date DATE, -- 退職日（退職済みの場合）
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- スキルマトリクス
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  name TEXT NOT NULL,
  category TEXT, -- 'technical', 'management', 'customer', 'compliance'
  criticality TEXT, -- 'critical', 'important', 'nice_to_have'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE employee_skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id),
  skill_id UUID REFERENCES skills(id),
  proficiency INTEGER, -- 1-5
  is_primary_owner BOOLEAN DEFAULT FALSE, -- この業務の主担当か
  UNIQUE(employee_id, skill_id)
);

-- リスク診断
CREATE TABLE risk_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  overall_score INTEGER, -- 0-100 (高いほどリスク大)
  dimension_scores JSONB, -- {age: 72, keyperson: 85, turnover: 45, seasonal: 30, succession: 60}
  department_scores JSONB, -- {営業部: 65, 製造部: 82, ...}
  recommendations JSONB, -- AIが生成した推奨アクション
  assessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 予測データ
CREATE TABLE workforce_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  forecast_month DATE,
  department TEXT,
  current_headcount INTEGER,
  predicted_headcount INTEGER,
  predicted_shortage INTEGER,
  confidence FLOAT, -- 0.0-1.0
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 業界ベンチマーク
CREATE TABLE industry_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  industry_code TEXT NOT NULL,
  year INTEGER,
  avg_turnover_rate FLOAT,
  avg_employee_age FLOAT,
  shortage_rate FLOAT,
  bankruptcy_risk_index FLOAT,
  data_source TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- アクションプラン
CREATE TABLE action_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  risk_assessment_id UUID REFERENCES risk_assessments(id),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT, -- 'hiring', 'dx', 'training', 'outsourcing', 'succession'
  priority TEXT, -- 'urgent', 'high', 'medium', 'low'
  estimated_cost TEXT,
  estimated_timeline TEXT,
  status TEXT DEFAULT 'proposed', -- 'proposed', 'in_progress', 'completed', 'dismissed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 収益モデル

### 無料プラン
- 従業員10名まで登録
- 基本リスクスコア表示（総合スコアのみ）
- 年2回の診断実行
- 業界ベンチマーク比較（基本）
- リスクアラート（メール月1回）

### Proプラン ($9.99/月 ≈ ¥1,500/月)
- 従業員50名まで登録
- 詳細リスクダッシュボード（5軸分析）
- キーパーソン依存度分析
- 月次の予測型人員計画
- 部署別リスクスコア
- アクションプラン自動生成（月3件）
- PDFレポート出力
- メールアラート（カスタマイズ可）

### Businessプラン ($24.99/月 ≈ ¥3,750/月)
- 従業員200名まで登録
- 全Proプラン機能
- 無制限のアクションプラン生成
- 事業承継リスク評価
- 外部コンサルタント共有機能
- API連携（SmartHR、freee人事労務）
- カスタムレポートテンプレート
- 優先サポート

## 競合分析

| 競合 | 強み | 弱み | 差別化ポイント |
|------|------|------|----------------|
| HRBrain | 高機能な人事評価・分析、大企業の導入実績 | 月額数万円〜と中小企業には高額、導入に数ヶ月 | HaboRiskは「リスク診断」に特化し低価格・即日導入可能 |
| SmartHR | 労務管理の定番、API豊富 | 人手不足リスク分析機能はない、分析は大企業向け | SmartHRは労務管理、HaboRiskはリスク分析と棲み分け可能 |
| ミイダス（HuRAid） | 離職リスク予測、勤怠分析 | 採用サービスと一体で割高、小規模事業者には機能過多 | HaboRiskは「倒産防止」の観点から人手不足リスク全体を診断 |
| 帝国データバンク（TDB） | 信用情報の権威、業界データ豊富 | レポート単体で高額、リアルタイム診断ではない | TDBデータを参考にしつつ、自社従業員データとの連携でリアルタイム診断 |

## マーケティング戦略

### SEOキーワード
- 「人手不足 対策 中小企業」（推定月間検索: 4,400回）
- 「人手不足倒産 防止」（推定月間検索: 1,600回）
- 「従業員 離職 予測」（推定月間検索: 880回）
- 「キーパーソン依存 リスク」（推定月間検索: 720回）
- 「中小企業 採用計画 ツール」（推定月間検索: 1,200回）
- 「事業承継 リスク 診断」（推定月間検索: 960回）

### コンテンツマーケティング
- **ブログ記事**: 「人手不足倒産を防ぐ5つの兆候」「建設業の人手不足対策完全ガイド」など、業種別・課題別の実用記事を週1本公開
- **データレポート**: 四半期ごとに「業種別人手不足リスクインデックス」を無料公開。メディア引用を狙いPR効果も期待
- **事例インタビュー**: HaboRiskを導入してリスクを軽減した中小企業の成功事例を月1本制作
- **メールマガジン**: 人手不足関連ニュース、統計データ、対策ノウハウを週1配信

### コミュニティ構築
- **士業パートナープログラム**: 中小企業診断士・社会保険労務士が顧問先にHaboRiskを推薦できるパートナー制度。レベニューシェア20%
- **業界別ユーザーコミュニティ**: 建設業、製造業、飲食業などの業界別Discordチャンネルで経営者同士の情報交換を促進
- **地域金融機関連携**: 信用金庫・地方銀行の融資審査材料としてHaboRiskレポートの活用を提案
- **行政連携**: ハローワーク、産業振興センターと連携し、人手不足対策セミナーを共同開催

## 開発ロードマップ

### Phase 1 (MVP - 2週間)
- ユーザー認証（Supabase Auth）
- 組織情報・従業員情報の登録フォーム
- 基本リスクスコア算出ロジック（年齢構成、キーパーソン度、離職率の3軸）
- シンプルなダッシュボード表示（ゲージチャート、レーダーチャート）
- ランディングページ・料金ページ
- Stripe決済連携

### Phase 2 (Growth - 1ヶ月)
- 5軸リスク分析（季節変動、事業承継追加）
- キーパーソン依存度マトリクス
- 予測型人員計画ツール（12ヶ月予測）
- 業界ベンチマーク比較機能
- AI搭載アクションプラン生成
- PDFレポート出力
- Businessプラン追加

### Phase 3 (Scale - 2ヶ月)
- SmartHR/freee人事労務API連携
- CSVインポート機能（既存人事データの一括取込）
- カスタムアラート設定
- 士業向けマルチクライアント管理
- 地域金融機関向けレポートフォーマット
- モバイル対応（PWA）

## リスクと対策

1. **従業員データ入力のハードル**: 中小企業は人事データがExcel管理の場合が多く、システムへの入力が面倒
   - **対策**: CSVインポート機能を早期実装。最小限の情報（氏名、部署、生年月日、入社日）だけで基本診断が可能な設計にする

2. **プライバシー懸念**: 従業員の個人情報をクラウドに保存することへの抵抗
   - **対策**: Supabaseの行レベルセキュリティ、データ暗号化を実装。個人名の入力を任意にし、匿名化オプションを提供

3. **リスクスコアの信頼性**: 独自スコアリングの根拠に対する疑問
   - **対策**: 帝国データバンク、東京商工リサーチなど公的機関のデータをもとにアルゴリズムを構築。スコアの算出根拠を透明性高く公開

4. **景気変動の影響**: 景気後退期には人手不足が一時的に緩和される可能性
   - **対策**: 「構造的な人手不足」（少子高齢化）と「景気循環的な人手不足」を分離して診断。長期的な人口動態リスクは景気に関係なく提示

## KPI

| KPI | 目標値（6ヶ月） | 目標値（12ヶ月） |
|-----|-----------------|-----------------|
| 無料登録企業数 | 5,000社 | 20,000社 |
| 有料契約社数 | 300社 | 1,500社 |
| MRR（月次経常収益） | $3,600 | $18,000 |
| 無料→有料転換率 | 6% | 8% |
| 月間チャーン率 | <5% | <3% |
| 従業員データ登録率 | 70%（登録企業のうち） | 85% |
| CAC（顧客獲得コスト） | <$25 | <$18 |
| LTV（顧客生涯価値） | >$144 | >$240 |
| NPS（推奨スコア） | >25 | >40 |
| 士業パートナー数 | 30事務所 | 120事務所 |
