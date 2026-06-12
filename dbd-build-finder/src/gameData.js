// ============================================================
// StalkLab ゲームデータ(自前JSON方針 / 要件定義 §3, §11)
// パーク名・アドオン名は通称を含む。ゲーム内表記と要照合。
// ============================================================

// パーク候補(入力補完用。自由入力も可)
export const PERK_SUGGESTIONS = [
  "死を呼ぶ追跡者 (Lethal Pursuer)",
  "隠れ場なし (Nowhere to Hide)",
  "バーベキュー&チリ (BBQ & Chili)",
  "苦悶の根源 (Pain Resonance)",
  "イタチが飛び出した (Pop Goes the Weasel)",
  "堕落の介入 (Corrupt Intervention)",
  "死人のスイッチ (Dead Man's Switch)",
  "デッドロック (Deadlock)",
  "不協和音 (Discordance)",
  "監視 (Surveillance)",
  "海の呼び声 (Call of Brine)",
  "ずさんな肉屋 (Sloppy Butcher)",
  "まやかし (Bamboozle)",
  "不屈 (Enduring)",
  "怨霊の怒り (Spirit Fury)",
  "看護婦の使命 (A Nurse's Calling)",
  "囁き (Whispers)",
  "終末論者 (No Way Out)",
  "呪術:破滅 (Hex: Ruin)",
  "呪術:不死 (Hex: Undying)",
  "呪術:誰も死から逃れられない (NOED)",
  "怨恨 (Rancor)",
  "ガラクタいじり (Tinkerer)",
  "野蛮な力 (Brutal Strength)",
  "鋼の握力 (Iron Grasp)",
  "興奮 (Agitation)",
];

// ゴーストフェイス用アドオンの入力補完(名称はゲーム内表記と要照合)
export const ADDON_SUGGESTIONS = [
  "屋外用防犯カメラ",
  "望遠レンズ",
  "ナイフ用レッグシース",
  "マークした地図",
  "被害者の詳細なルート",
  "オルセンの住所録",
  "オルセンの財布",
  "噛んだペン",
];

// タグ定義(要件定義 §5)
export const BUILD_TAGS = [
  "全滅狙い", "初動重視", "索敵型", "99stalk特化",
  "遅延併用", "屋内マップ強", "初心者向け", "上級者向け",
];

export const SPOT_TAGS = ["コーナーstalk", "リーンstalk", "初動用", "屋内強", "99溜め"];

export const NOTE_TAGS = ["初動", "中盤", "終盤", "全滅狙い", "分断", "発電機意識"];

// マップ一覧(Realm別 / isIndoor)。不足分はアプリ内から追加可能。
export const BASE_MAPS = [
  { id: "coal_tower", name: "石炭の塔", realm: "マクミラン・エステート", isIndoor: false },
  { id: "suffocation_pit", name: "窒息ピット", realm: "マクミラン・エステート", isIndoor: false },
  { id: "blood_lodge", name: "ブラッド・ロッジ", realm: "オートヘイヴン・レッカーズ", isIndoor: false },
  { id: "gas_heaven", name: "ガス・ヘヴン", realm: "オートヘイヴン・レッカーズ", isIndoor: false },
  { id: "thompson_house", name: "トンプソンの家", realm: "コールドウィンド・ファーム", isIndoor: false },
  { id: "treatment_theatre", name: "治療シアター", realm: "レリー記念研究所", isIndoor: true },
  { id: "crotus_prenn", name: "クロータス・プレン・アサイラム", realm: "クロータス・プレン", isIndoor: false },
  { id: "lampkin_lane", name: "ランプキン・レーン", realm: "ハドンフィールド", isIndoor: false },
  { id: "pale_rose", name: "ペイル・ローズ", realm: "バックウォーター・スワンプ", isIndoor: false },
  { id: "family_residence", name: "家族の住居", realm: "ヤマオカ邸", isIndoor: false },
  { id: "badham", name: "バダム幼稚園", realm: "スプリングウッド", isIndoor: false },
  { id: "the_game", name: "ザ・ゲーム", realm: "ギデオン食肉プラント", isIndoor: true },
  { id: "mothers_dwelling", name: "母の住処", realm: "レッド・フォレスト", isIndoor: false },
  { id: "ormond", name: "オーモンド山リゾート", realm: "オーモンド", isIndoor: false },
  { id: "dead_dawg", name: "死せる犬の酒場", realm: "グレンベール", isIndoor: false },
  { id: "midwich", name: "ミッドウィッチ小学校", realm: "サイレントヒル", isIndoor: true },
  { id: "rpd", name: "ラクーンシティ警察署", realm: "ラクーンシティ", isIndoor: true },
  { id: "garden_of_joy", name: "喜びの庭", realm: "ウィザーシン", isIndoor: false },
];

// プリセットビルド(叩き台。Firestoreスキーマ perkBuilds 互換)
export const PRESET_BUILDS = [
  {
    id: "preset_1",
    isPreset: true,
    perk1: "死を呼ぶ追跡者 (Lethal Pursuer)",
    perk2: "隠れ場なし (Nowhere to Hide)",
    perk3: "ずさんな肉屋 (Sloppy Butcher)",
    perk4: "苦悶の根源 (Pain Resonance)",
    addon1: "屋外用防犯カメラ",
    addon2: "望遠レンズ",
    tags: ["索敵型", "初動重視"],
    concept:
      "初動で位置を掴んで最速で1stalkを通す型。リーサルで初動の奇襲ルートを決め、発電機キック時の隠れ場なしで「探す時間」をゼロに近づける。ずさんで治療時間を稼ぎ、その間に次の獲物をマーキング。",
    strongMaps: ["石炭の塔", "死せる犬の酒場"],
    weakMaps: ["母の住処"],
    opponentNote: "背後警戒が強いVCパーティ相手はリーン主体に切り替える。",
    likes: 0, usedCount: 0, createdAt: 0,
  },
  {
    id: "preset_2",
    isPreset: true,
    perk1: "堕落の介入 (Corrupt Intervention)",
    perk2: "イタチが飛び出した (Pop Goes the Weasel)",
    perk3: "デッドロック (Deadlock)",
    perk4: "まやかし (Bamboozle)",
    addon1: "マークした地図",
    addon2: "ナイフ用レッグシース",
    tags: ["遅延併用", "全滅狙い"],
    concept:
      "stalkに時間を使う分、発電機をパークで止める遅延寄せ。堕落で序盤の行動範囲を絞り、マーキング→ダウン→イタチのサイクルを回す。窓が強いマップはまやかしで強引に詰める。",
    strongMaps: ["ザ・ゲーム", "治療シアター"],
    weakMaps: ["ランプキン・レーン"],
    opponentNote: "分散修理が上手いチームにはデッドロックが特に刺さる。",
    likes: 0, usedCount: 0, createdAt: 0,
  },
];

// マップ別・ゴーストフェイス立ち回りサンプル(strategyNotes互換)
export const PRESET_NOTES = [
  {
    id: "note_preset_1",
    isPreset: true,
    mapId: "the_game",
    title: "ザ・ゲーム: 2階から音で当たりをつけて階段奇襲",
    body: "屋内マップの中でも視線切りが豊富で、能力中の接近が通りやすい。上下階の足音・発電機音で位置を推定し、階段やスロープの死角からしゃがみ接近。板が非常に多いマップなので、チェイスを引きずらず奇襲ワンパンを徹底する。",
    tags: ["初動", "全滅狙い"],
    likes: 0, createdAt: 0,
  },
  {
    id: "note_preset_2",
    isPreset: true,
    mapId: "lampkin_lane",
    title: "ランプキン・レーン: 通りを横切らず家伝いに移動",
    body: "中央の通りは見通しが良くリビールされやすい。家の裏手と塀沿いを使って移動し、窓やフェンス越しのリーンstalkを主体にする。2階窓からの俯瞰stalkが通るポイントが複数ある。",
    tags: ["中盤", "分断"],
    likes: 0, createdAt: 0,
  },
];
