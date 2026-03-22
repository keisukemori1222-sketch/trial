import type { EvaluationItem, Shokushu } from "@/types/database";

// ── 共通項目（全職種共通・15項目） ──
export const commonItems: EvaluationItem[] = [
  // カテゴリー1：プロの土台を築く
  {
    item_id: "C01",
    item_type: "common",
    category: "プロの土台を築く",
    name: "プロとしての基本を貫く",
  },
  {
    item_id: "C02",
    item_type: "common",
    category: "プロの土台を築く",
    name: "全体を見て、優先順位をつける",
  },
  {
    item_id: "C03",
    item_type: "common",
    category: "プロの土台を築く",
    name: "安全・品質を最優先する",
  },
  {
    item_id: "C04",
    item_type: "common",
    category: "プロの土台を築く",
    name: "正確さ・丁寧さを妥協しない",
  },
  {
    item_id: "C05",
    item_type: "common",
    category: "プロの土台を築く",
    name: "美しさと品格にこだわる",
  },
  // カテゴリー2：お客様の心を動かす
  {
    item_id: "C06",
    item_type: "common",
    category: "お客様の心を動かす",
    name: "お客様を観察し、先を読む",
  },
  {
    item_id: "C07",
    item_type: "common",
    category: "お客様の心を動かす",
    name: "「できない」で終わらせない",
  },
  {
    item_id: "C08",
    item_type: "common",
    category: "お客様の心を動かす",
    name: "お客様のために行動できる",
  },
  {
    item_id: "C09",
    item_type: "common",
    category: "お客様の心を動かす",
    name: "五感で感じ、物語を届ける",
  },
  // カテゴリー3：仲間とともに高め合う
  {
    item_id: "C10",
    item_type: "common",
    category: "仲間とともに高め合う",
    name: "必要な情報を共有する",
  },
  {
    item_id: "C11",
    item_type: "common",
    category: "仲間とともに高め合う",
    name: "後輩の成長に責任を持つ",
  },
  {
    item_id: "C12",
    item_type: "common",
    category: "仲間とともに高め合う",
    name: "チームで成果を出す",
  },
  {
    item_id: "C13",
    item_type: "common",
    category: "仲間とともに高め合う",
    name: "仲間の気持ちに寄り添う",
  },
  // カテゴリー4：自分を磨き続ける
  {
    item_id: "C14",
    item_type: "common",
    category: "自分を磨き続ける",
    name: "ひらまつらしさを体現する",
  },
  {
    item_id: "C15",
    item_type: "common",
    category: "自分を磨き続ける",
    name: "自ら学び、改善し続ける",
  },
];

// ── 料理人 独自項目（6項目） ──
export const cookItems: EvaluationItem[] = [
  {
    item_id: "U_R01",
    item_type: "unique",
    category: "料理人の専門性",
    name: "調理技術の習得と実践",
    shokushu: "料理人",
  },
  {
    item_id: "U_R02",
    item_type: "unique",
    category: "料理人の専門性",
    name: "食材の理解と管理",
    shokushu: "料理人",
  },
  {
    item_id: "U_R03",
    item_type: "unique",
    category: "料理人の専門性",
    name: "レシピの読解と再現",
    shokushu: "料理人",
  },
  {
    item_id: "U_R04",
    item_type: "unique",
    category: "料理人の専門性",
    name: "味覚と美的感覚",
    shokushu: "料理人",
  },
  {
    item_id: "U_R05",
    item_type: "unique",
    category: "料理人の専門性",
    name: "原価とコストの意識",
    shokushu: "料理人",
  },
  {
    item_id: "U_R06",
    item_type: "unique",
    category: "料理人の専門性",
    name: "専門知識と食文化の理解",
    shokushu: "料理人",
  },
];

// ── サービス人 独自項目（6項目） ──
export const serviceItems: EvaluationItem[] = [
  {
    item_id: "U_S01",
    item_type: "unique",
    category: "サービス人の専門性",
    name: "商品・サービスを深く理解し伝える",
    shokushu: "サービス人",
  },
  {
    item_id: "U_S02",
    item_type: "unique",
    category: "サービス人の専門性",
    name: "お客様情報を把握しサービスに活かす",
    shokushu: "サービス人",
  },
  {
    item_id: "U_S03",
    item_type: "unique",
    category: "サービス人の専門性",
    name: "自分の持ち場のオペレーションを遂行する",
    shokushu: "サービス人",
  },
  {
    item_id: "U_S04",
    item_type: "unique",
    category: "サービス人の専門性",
    name: "専門性を磨き続ける",
    shokushu: "サービス人",
  },
  {
    item_id: "U_S05",
    item_type: "unique",
    category: "サービス人の専門性",
    name: "お客様の入口と出口を管理する",
    shokushu: "サービス人",
  },
  {
    item_id: "U_S06",
    item_type: "unique",
    category: "サービス人の専門性",
    name: "空間の品質を守り高める",
    shokushu: "サービス人",
  },
];

// ── ブライダル 独自項目（7項目） ──
export const bridalItems: EvaluationItem[] = [
  {
    item_id: "U_B01",
    item_type: "unique",
    category: "ブライダルの専門性",
    name: "お客様の想いをカタチにする",
    shokushu: "ブライダル",
  },
  {
    item_id: "U_B02",
    item_type: "unique",
    category: "ブライダルの専門性",
    name: "商品・パートナーの価値を活かす",
    shokushu: "ブライダル",
  },
  {
    item_id: "U_B03",
    item_type: "unique",
    category: "ブライダルの専門性",
    name: "成果を自ら創り出す",
    shokushu: "ブライダル",
  },
  {
    item_id: "U_B04",
    item_type: "unique",
    category: "ブライダルの専門性",
    name: "一生の物語に寄り添い続ける",
    shokushu: "ブライダル",
  },
  {
    item_id: "U_B05",
    item_type: "unique",
    category: "ブライダルの専門性",
    name: "自ら学び、進化し続ける",
    shokushu: "ブライダル",
  },
  {
    item_id: "U_B06",
    item_type: "unique",
    category: "ブライダルの専門性",
    name: "選ばれる理由を自ら作る",
    shokushu: "ブライダル",
  },
  {
    item_id: "U_B07",
    item_type: "unique",
    category: "ブライダルの専門性",
    name: "婚礼の一日をプロデュースする",
    shokushu: "ブライダル",
  },
];

// すべての項目
export const allItems: EvaluationItem[] = [
  ...commonItems,
  ...cookItems,
  ...serviceItems,
  ...bridalItems,
];

// 職種に応じた評価項目を取得
export function getItemsForShokushu(shokushu: Shokushu): EvaluationItem[] {
  const uniqueItems = allItems.filter(
    (item) => item.item_type === "common" || item.shokushu === shokushu
  );
  return uniqueItems;
}

// カテゴリー別にグループ化
export function groupByCategory(
  items: EvaluationItem[]
): Record<string, EvaluationItem[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    },
    {} as Record<string, EvaluationItem[]>
  );
}

// スコアラベル
export const scoreLabels: Record<number, string> = {
  1: "まだ",
  2: "意識中",
  3: "できている",
  4: "体に染みついた",
};

export const scoreDescriptions: Record<number, string> = {
  1: "まだできていない",
  2: "意識してやっている",
  3: "安定してできる",
  4: "無意識にできる・後輩に教えられる",
};
