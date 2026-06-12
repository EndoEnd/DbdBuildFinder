import { useState, useEffect, useMemo } from "react";
import {
  PERK_SUGGESTIONS, ADDON_SUGGESTIONS,
  BUILD_TAGS, SPOT_TAGS, NOTE_TAGS,
  BASE_MAPS, PRESET_BUILDS, PRESET_NOTES,
} from "./gameData.js";

// ============================================================
// StalkLab v0.2 (シングルユーザー版)
// データ構造は要件定義書のFirestoreスキーマと同一フィールド名。
// 将来 Firebase 移行時は storage 層(load/save)のみ差し替える。
// ============================================================

// ---------- 保存層(localStorage) ----------
const KEYS = {
  builds: "stalklab_perkBuilds",
  spots: "stalklab_stalkSpots",
  notes: "stalklab_strategyNotes",
  maps: "stalklab_customMaps",
  seeded: "stalklab_seeded_v1",
};

function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("保存に失敗しました", e);
  }
}
function seedOnce() {
  if (!localStorage.getItem(KEYS.seeded)) {
    save(KEYS.builds, PRESET_BUILDS.map((b) => ({ ...b, createdAt: Date.now() })));
    save(KEYS.notes, PRESET_NOTES.map((n) => ({ ...n, createdAt: Date.now() })));
    save(KEYS.spots, []);
    save(KEYS.maps, []);
    localStorage.setItem(KEYS.seeded, "1");
  }
}
const uid = (p) => `${p}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

// ---------- テーマ(要件定義 §7: 黒基調+赤アクセント) ----------
const C = {
  bg: "#0a0a0a", panel: "#141414", panel2: "#1c1c1c", border: "#2a2a2a",
  text: "#f2f2f2", sub: "#9a9a9a", faint: "#5a5a5a",
  accent: "#cc0000", accentHi: "#ff4d4d",
};
const inputStyle = {
  background: C.panel2, border: `1px solid ${C.border}`, color: C.text,
  borderRadius: 6, padding: "8px 10px", fontSize: 13, width: "100%",
};
const labelStyle = { fontSize: 11, color: C.sub, display: "block", marginBottom: 4, marginTop: 10 };

// ---------- 汎用部品 ----------
function TagPicker({ all, selected, onChange }) {
  const toggle = (t) =>
    onChange(selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {all.map((t) => {
        const on = selected.includes(t);
        return (
          <button key={t} type="button" onClick={() => toggle(t)}
            className="rounded-full px-2.5 py-1"
            style={{
              fontSize: 11,
              background: on ? C.accent : C.panel2,
              color: on ? "#fff" : C.sub,
              border: `1px solid ${on ? C.accent : C.border}`,
            }}>
            #{t}
          </button>
        );
      })}
    </div>
  );
}

function Tag({ t }) {
  return (
    <span className="rounded-full px-2 py-0.5"
      style={{ fontSize: 10, color: C.accentHi, border: `1px solid ${C.accent}55`, background: "#1a0d0d" }}>
      #{t}
    </span>
  );
}

function SectionTitle({ children }) {
  return (
    <div style={{ fontSize: 11, color: C.faint, letterSpacing: "0.2em", margin: "14px 0 6px" }}>
      {children}
    </div>
  );
}

// ============================================================
// ビルドタブ
// ============================================================
function BuildForm({ initial, onSubmit, onCancel }) {
  const [f, setF] = useState(
    initial || {
      perk1: "", perk2: "", perk3: "", perk4: "",
      addon1: "", addon2: "", tags: [], concept: "",
      strongMaps: [], weakMaps: [], opponentNote: "",
    }
  );
  const set = (k, v) => setF({ ...f, [k]: v });
  const submit = () => {
    if (!f.perk1 && !f.perk2 && !f.perk3 && !f.perk4) {
      alert("パークを1つ以上入力してください");
      return;
    }
    onSubmit(f);
  };
  return (
    <div className="rounded-lg p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.accent}66` }}>
      <div style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: 16, color: C.text }}>
        {initial ? "ビルドを編集" : "ビルドを登録"}
      </div>
      <datalist id="perk-list">
        {PERK_SUGGESTIONS.map((p) => <option key={p} value={p} />)}
      </datalist>
      <datalist id="addon-list">
        {ADDON_SUGGESTIONS.map((a) => <option key={a} value={a} />)}
      </datalist>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
        {[1, 2, 3, 4].map((n) => (
          <div key={n}>
            <label style={labelStyle}>パーク{n}</label>
            <input style={inputStyle} list="perk-list" value={f[`perk${n}`]}
              onChange={(e) => set(`perk${n}`, e.target.value)} placeholder="入力または候補から選択" />
          </div>
        ))}
        {[1, 2].map((n) => (
          <div key={n}>
            <label style={labelStyle}>アドオン{n}</label>
            <input style={inputStyle} list="addon-list" value={f[`addon${n}`]}
              onChange={(e) => set(`addon${n}`, e.target.value)} placeholder="例: 望遠レンズ" />
          </div>
        ))}
      </div>
      <label style={labelStyle}>タグ</label>
      <TagPicker all={BUILD_TAGS} selected={f.tags} onChange={(v) => set("tags", v)} />
      <label style={labelStyle}>コンセプト</label>
      <textarea style={{ ...inputStyle, minHeight: 70 }} value={f.concept}
        onChange={(e) => set("concept", e.target.value)} placeholder="このビルドの狙い・回し方" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
        <div>
          <label style={labelStyle}>強いマップ(カンマ区切り)</label>
          <input style={inputStyle} value={f.strongMaps.join(", ")}
            onChange={(e) => set("strongMaps", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </div>
        <div>
          <label style={labelStyle}>苦手なマップ(カンマ区切り)</label>
          <input style={inputStyle} value={f.weakMaps.join(", ")}
            onChange={(e) => set("weakMaps", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} />
        </div>
      </div>
      <label style={labelStyle}>相手構成メモ</label>
      <input style={inputStyle} value={f.opponentNote}
        onChange={(e) => set("opponentNote", e.target.value)} placeholder="ループ強サバ対策など" />
      <div className="flex gap-2 mt-4">
        <button onClick={submit} className="rounded px-4 py-2"
          style={{ background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700 }}>
          保存する
        </button>
        <button onClick={onCancel} className="rounded px-4 py-2"
          style={{ background: C.panel2, color: C.sub, fontSize: 13, border: `1px solid ${C.border}` }}>
          キャンセル
        </button>
      </div>
    </div>
  );
}

function BuildCard({ build, onLike, onUsed, onEdit, onDelete }) {
  const perks = [build.perk1, build.perk2, build.perk3, build.perk4].filter(Boolean);
  const addons = [build.addon1, build.addon2].filter(Boolean);
  return (
    <div className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap gap-1.5">
          {build.isPreset && (
            <span className="rounded px-1.5 py-0.5" style={{ fontSize: 10, color: C.sub, border: `1px solid ${C.border}` }}>
              プリセット
            </span>
          )}
          {build.tags.map((t) => <Tag key={t} t={t} />)}
        </div>
        <div className="flex gap-2 flex-shrink-0" style={{ fontSize: 11 }}>
          <button onClick={onEdit} style={{ color: C.sub }}>編集</button>
          <button onClick={onDelete} style={{ color: C.accentHi }}>削除</button>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {perks.map((p) => (
          <span key={p} className="rounded px-2 py-1"
            style={{ fontSize: 12, color: C.text, background: C.panel2, border: `1px solid ${C.border}` }}>
            ◆ {p}
          </span>
        ))}
      </div>
      {addons.length > 0 && (
        <div style={{ fontSize: 12, color: C.sub, marginBottom: 6 }}>
          アドオン: {addons.join(" / ")}
        </div>
      )}
      {build.concept && <p style={{ fontSize: 13, color: "#cfcfcf", margin: "6px 0" }}>{build.concept}</p>}
      {(build.strongMaps.length > 0 || build.weakMaps.length > 0) && (
        <div style={{ fontSize: 11, color: C.sub }}>
          {build.strongMaps.length > 0 && <>得意: {build.strongMaps.join("、")} </>}
          {build.weakMaps.length > 0 && <> / 苦手: {build.weakMaps.join("、")}</>}
        </div>
      )}
      {build.opponentNote && (
        <div className="rounded px-2 py-1.5 mt-2"
          style={{ fontSize: 11, color: C.sub, background: "#101010", borderLeft: `2px solid ${C.accent}` }}>
          対策メモ: {build.opponentNote}
        </div>
      )}
      <div className="flex gap-2 mt-3">
        <button onClick={onLike} className="rounded px-3 py-1"
          style={{ fontSize: 12, color: C.accentHi, border: `1px solid ${C.accent}55`, background: "#1a0d0d" }}>
          ♥ いいね {build.likes}
        </button>
        <button onClick={onUsed} className="rounded px-3 py-1"
          style={{ fontSize: 12, color: C.sub, border: `1px solid ${C.border}`, background: C.panel2 }}>
          ✓ 使ってみた {build.usedCount}
        </button>
      </div>
    </div>
  );
}

function BuildsTab({ builds, setBuilds }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filterTags, setFilterTags] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState("new");

  const list = useMemo(() => {
    let l = builds.filter((b) => {
      const tagOk = filterTags.length === 0 || filterTags.every((t) => b.tags.includes(t));
      const text = [b.perk1, b.perk2, b.perk3, b.perk4, b.addon1, b.addon2, b.concept].join(" ");
      const kwOk = !keyword || text.toLowerCase().includes(keyword.toLowerCase());
      return tagOk && kwOk;
    });
    if (sort === "new") l = [...l].sort((a, b) => b.createdAt - a.createdAt);
    if (sort === "likes") l = [...l].sort((a, b) => b.likes - a.likes);
    if (sort === "used") l = [...l].sort((a, b) => b.usedCount - a.usedCount);
    return l;
  }, [builds, filterTags, keyword, sort]);

  const upsert = (data) => {
    if (editing) {
      setBuilds(builds.map((b) => (b.id === editing.id ? { ...editing, ...data } : b)));
    } else {
      setBuilds([{ id: uid("b"), likes: 0, usedCount: 0, createdAt: Date.now(), ...data }, ...builds]);
    }
    setShowForm(false);
    setEditing(null);
  };
  const bump = (id, key) =>
    setBuilds(builds.map((b) => (b.id === id ? { ...b, [key]: b[key] + 1 } : b)));
  const remove = (id) => {
    if (confirm("このビルドを削除しますか?")) setBuilds(builds.filter((b) => b.id !== id));
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <input style={{ ...inputStyle, width: 220 }} value={keyword}
          onChange={(e) => setKeyword(e.target.value)} placeholder="キーワード検索" />
        <select style={{ ...inputStyle, width: 150 }} value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="new">新着順</option>
          <option value="likes">いいね順</option>
          <option value="used">使ってみた順</option>
        </select>
        <button onClick={() => { setEditing(null); setShowForm(!showForm); }}
          className="rounded px-4 py-2 ml-auto"
          style={{ background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700 }}>
          + ビルドを登録
        </button>
      </div>
      <TagPicker all={BUILD_TAGS} selected={filterTags} onChange={setFilterTags} />
      <div className="mt-4" />
      {(showForm || editing) && (
        <BuildForm initial={editing} onSubmit={upsert}
          onCancel={() => { setShowForm(false); setEditing(null); }} />
      )}
      <div className="grid gap-3">
        {list.map((b) => (
          <BuildCard key={b.id} build={b}
            onLike={() => bump(b.id, "likes")}
            onUsed={() => bump(b.id, "usedCount")}
            onEdit={() => { setEditing(b); setShowForm(false); }}
            onDelete={() => remove(b.id)} />
        ))}
        {list.length === 0 && (
          <div className="text-center py-10" style={{ color: C.faint, fontSize: 13 }}>
            条件に合うビルドがありません。「+ ビルドを登録」から最初の1件を追加できます。
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// マップ&覗きスポットタブ
// ============================================================
function MapLayout({ isIndoor, spots, onMapClick, onPinClick, selectedSpotId, addMode }) {
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", aspectRatio: "4 / 3", cursor: addMode ? "crosshair" : "default", display: "block" }}
      onClick={(e) => {
        if (!addMode) return;
        const r = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        onMapClick(Math.round(x * 10) / 10, Math.round(y * 10) / 10);
      }}>
      {/* 簡易プレースホルダー図(自作レイアウト図に将来差し替え) */}
      <rect x="1" y="1" width="98" height="98" fill="#101010" stroke="#3a3a3a" strokeWidth="0.8" />
      {isIndoor ? (
        <g stroke="#3a3a3a" strokeWidth="0.6" fill="#181818">
          <rect x="8" y="8" width="35" height="30" />
          <rect x="57" y="8" width="35" height="30" />
          <rect x="8" y="62" width="35" height="30" />
          <rect x="57" y="62" width="35" height="30" />
          <rect x="44" y="1" width="12" height="98" fill="#141414" />
          <rect x="1" y="44" width="98" height="12" fill="#141414" />
        </g>
      ) : (
        <g stroke="#3a3a3a" strokeWidth="0.6">
          <rect x="14" y="12" width="28" height="22" fill="#181818" />
          <rect x="72" y="70" width="16" height="14" fill="#181818" />
          <circle cx="62" cy="28" r="4" fill="#161616" />
          <circle cx="30" cy="68" r="5" fill="#161616" />
          <circle cx="52" cy="52" r="3" fill="#161616" />
          <rect x="78" y="20" width="10" height="6" fill="#161616" />
        </g>
      )}
      <text x="28" y="24" fontSize="3.2" fill="#5a5a5a" textAnchor="middle">
        {isIndoor ? "部屋" : "メイン建物"}
      </text>
      {!isIndoor && (
        <text x="80" y="78" fontSize="3" fill="#5a5a5a" textAnchor="middle">小屋</text>
      )}
      {spots.map((s) => (
        <g key={s.id} style={{ cursor: "pointer" }}
          onClick={(e) => { e.stopPropagation(); onPinClick(s.id); }}>
          <circle cx={s.x} cy={s.y} r={s.id === selectedSpotId ? 3.2 : 2.4}
            fill={s.id === selectedSpotId ? "#ff4d4d" : "#cc0000"} stroke="#0a0a0a" strokeWidth="0.5" />
          <circle cx={s.x} cy={s.y} r="0.8" fill="#0a0a0a" />
        </g>
      ))}
    </svg>
  );
}

function SpotForm({ coords, onSubmit, onCancel }) {
  const [f, setF] = useState({ title: "", advantage: "", caution: "", tags: [] });
  return (
    <div className="rounded-lg p-4 my-3" style={{ background: C.panel, border: `1px solid ${C.accent}66` }}>
      <div style={{ fontSize: 13, color: C.text, marginBottom: 4 }}>
        新しい覗きスポット <span style={{ color: C.faint, fontSize: 11 }}>(x:{coords.x}, y:{coords.y})</span>
      </div>
      <label style={labelStyle}>スポット名</label>
      <input style={inputStyle} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })}
        placeholder="例: メイン建物2階・西窓リーン" />
      <label style={labelStyle}>利点</label>
      <input style={inputStyle} value={f.advantage} onChange={(e) => setF({ ...f, advantage: e.target.value })}
        placeholder="例: 発電機2台を同時に視認できる" />
      <label style={labelStyle}>注意点</label>
      <input style={inputStyle} value={f.caution} onChange={(e) => setF({ ...f, caution: e.target.value })}
        placeholder="例: 階段側からリビールされやすい" />
      <label style={labelStyle}>タグ</label>
      <TagPicker all={SPOT_TAGS} selected={f.tags} onChange={(v) => setF({ ...f, tags: v })} />
      <div className="flex gap-2 mt-4">
        <button onClick={() => f.title ? onSubmit(f) : alert("スポット名を入力してください")}
          className="rounded px-4 py-2" style={{ background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700 }}>
          ピンを保存
        </button>
        <button onClick={onCancel} className="rounded px-4 py-2"
          style={{ background: C.panel2, color: C.sub, fontSize: 13, border: `1px solid ${C.border}` }}>
          キャンセル
        </button>
      </div>
    </div>
  );
}

function MapsTab({ maps, onAddMap, spots, setSpots }) {
  const [selectedMapId, setSelectedMapId] = useState(null);
  const [addMode, setAddMode] = useState(false);
  const [pendingCoords, setPendingCoords] = useState(null);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [showMapForm, setShowMapForm] = useState(false);
  const [mapForm, setMapForm] = useState({ name: "", realm: "", isIndoor: false });

  const map = maps.find((m) => m.id === selectedMapId);
  const mapSpots = spots.filter((s) => s.mapId === selectedMapId);
  const selectedSpot = mapSpots.find((s) => s.id === selectedSpotId);

  const realms = useMemo(() => {
    const g = {};
    maps.forEach((m) => { (g[m.realm] = g[m.realm] || []).push(m); });
    return g;
  }, [maps]);

  const addSpot = (f) => {
    setSpots([
      { id: uid("s"), mapId: selectedMapId, x: pendingCoords.x, y: pendingCoords.y, ...f, likes: 0, createdAt: Date.now() },
      ...spots,
    ]);
    setPendingCoords(null);
    setAddMode(false);
  };
  const removeSpot = (id) => {
    if (confirm("このスポットを削除しますか?")) {
      setSpots(spots.filter((s) => s.id !== id));
      setSelectedSpotId(null);
    }
  };
  const addMap = () => {
    if (!mapForm.name || !mapForm.realm) { alert("マップ名とRealmを入力してください"); return; }
    onAddMap({ id: uid("m"), ...mapForm });
    setMapForm({ name: "", realm: "", isIndoor: false });
    setShowMapForm(false);
  };

  if (!map) {
    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <div style={{ fontSize: 12, color: C.sub }}>マップを選択すると覗きスポットを登録できます</div>
          <button onClick={() => setShowMapForm(!showMapForm)} className="rounded px-3 py-1.5"
            style={{ fontSize: 12, color: C.sub, border: `1px solid ${C.border}`, background: C.panel2 }}>
            + マップを追加
          </button>
        </div>
        {showMapForm && (
          <div className="rounded-lg p-4 mb-3" style={{ background: C.panel, border: `1px solid ${C.accent}66` }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-3">
              <div>
                <label style={labelStyle}>マップ名</label>
                <input style={inputStyle} value={mapForm.name}
                  onChange={(e) => setMapForm({ ...mapForm, name: e.target.value })} />
              </div>
              <div>
                <label style={labelStyle}>Realm(地域)</label>
                <input style={inputStyle} value={mapForm.realm}
                  onChange={(e) => setMapForm({ ...mapForm, realm: e.target.value })} />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-3" style={{ fontSize: 12, color: C.sub }}>
              <input type="checkbox" checked={mapForm.isIndoor}
                onChange={(e) => setMapForm({ ...mapForm, isIndoor: e.target.checked })} />
              屋内マップ
            </label>
            <button onClick={addMap} className="rounded px-4 py-2 mt-3"
              style={{ background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700 }}>
              追加する
            </button>
          </div>
        )}
        {Object.entries(realms).map(([realm, ms]) => (
          <div key={realm} className="mb-4">
            <SectionTitle>{realm}</SectionTitle>
            <div className="grid gap-2 sm:grid-cols-2">
              {ms.map((m) => {
                const count = spots.filter((s) => s.mapId === m.id).length;
                return (
                  <button key={m.id} onClick={() => setSelectedMapId(m.id)}
                    className="text-left rounded-lg px-4 py-3"
                    style={{ background: C.panel, border: `1px solid ${C.border}` }}>
                    <div style={{ fontSize: 14, color: C.text }}>
                      {m.name}
                      {m.isIndoor && <span style={{ fontSize: 10, color: C.sub, marginLeft: 6 }}>屋内</span>}
                    </div>
                    <div style={{ fontSize: 11, color: count > 0 ? C.accentHi : C.faint, marginTop: 2 }}>
                      覗きスポット {count}件
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <button onClick={() => { setSelectedMapId(null); setAddMode(false); setPendingCoords(null); setSelectedSpotId(null); }}
        className="mb-3 rounded px-3 py-1.5"
        style={{ background: C.panel2, border: `1px solid ${C.border}`, color: C.sub, fontSize: 12 }}>
        ← マップ一覧に戻る
      </button>
      <div className="flex items-baseline gap-2 mb-1">
        <h2 style={{ fontFamily: "'Shippori Mincho B1', serif", fontSize: 22, color: C.text }}>{map.name}</h2>
        <span style={{ fontSize: 11, color: C.sub }}>{map.realm}{map.isIndoor ? " ・ 屋内" : ""}</span>
      </div>
      <div style={{ fontSize: 11, color: C.faint, marginBottom: 8 }}>
        ※ レイアウト図は簡易プレースホルダーです(自作図に差し替え予定)。ピンの位置関係のメモとして使ってください。
      </div>
      <div className="rounded-lg overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
        <MapLayout isIndoor={map.isIndoor} spots={mapSpots} addMode={addMode}
          selectedSpotId={selectedSpotId}
          onMapClick={(x, y) => setPendingCoords({ x, y })}
          onPinClick={(id) => { setSelectedSpotId(id === selectedSpotId ? null : id); }} />
      </div>
      <div className="flex gap-2 mt-3">
        <button onClick={() => { setAddMode(!addMode); setPendingCoords(null); }}
          className="rounded px-4 py-2"
          style={{
            background: addMode ? C.accent : C.panel2, color: addMode ? "#fff" : C.sub,
            fontSize: 13, fontWeight: addMode ? 700 : 400, border: `1px solid ${addMode ? C.accent : C.border}`,
          }}>
          {addMode ? "図をクリックしてピンを置く(終了するには再クリック)" : "+ 覗きスポットを追加"}
        </button>
      </div>
      {pendingCoords && (
        <SpotForm coords={pendingCoords} onSubmit={addSpot} onCancel={() => setPendingCoords(null)} />
      )}
      {selectedSpot && (
        <div className="rounded-lg p-4 mt-3" style={{ background: C.panel, border: `1px solid ${C.accent}66` }}>
          <div className="flex items-start justify-between">
            <div style={{ fontSize: 15, color: C.text }}>{selectedSpot.title}</div>
            <button onClick={() => removeSpot(selectedSpot.id)} style={{ fontSize: 11, color: C.accentHi }}>削除</button>
          </div>
          <div className="flex flex-wrap gap-1.5 my-2">
            {selectedSpot.tags.map((t) => <Tag key={t} t={t} />)}
          </div>
          {selectedSpot.advantage && (
            <div style={{ fontSize: 12, color: "#cfcfcf" }}>利点: {selectedSpot.advantage}</div>
          )}
          {selectedSpot.caution && (
            <div style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>注意: {selectedSpot.caution}</div>
          )}
        </div>
      )}
      <SectionTitle>このマップのスポット一覧</SectionTitle>
      <div className="grid gap-2">
        {mapSpots.map((s) => (
          <button key={s.id} onClick={() => setSelectedSpotId(s.id)}
            className="text-left rounded px-3 py-2"
            style={{
              background: s.id === selectedSpotId ? "#1a0d0d" : C.panel,
              border: `1px solid ${s.id === selectedSpotId ? C.accent : C.border}`,
              fontSize: 13, color: C.text,
            }}>
            {s.title}
            <span style={{ fontSize: 10, color: C.faint, marginLeft: 8 }}>x:{s.x} y:{s.y}</span>
          </button>
        ))}
        {mapSpots.length === 0 && (
          <div style={{ fontSize: 12, color: C.faint }}>
            まだスポットがありません。「+ 覗きスポットを追加」→ 図をクリックで登録できます。
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// 立ち回りノートタブ
// ============================================================
function NotesTab({ notes, setNotes, maps }) {
  const [showForm, setShowForm] = useState(false);
  const [filterMapId, setFilterMapId] = useState("ALL");
  const [filterTags, setFilterTags] = useState([]);
  const [f, setF] = useState({ mapId: "", title: "", body: "", tags: [] });

  const list = notes.filter((n) => {
    const mapOk = filterMapId === "ALL" || n.mapId === filterMapId;
    const tagOk = filterTags.length === 0 || filterTags.every((t) => n.tags.includes(t));
    return mapOk && tagOk;
  }).sort((a, b) => b.createdAt - a.createdAt);

  const add = () => {
    if (!f.mapId || !f.title) { alert("マップとタイトルを入力してください"); return; }
    setNotes([{ id: uid("n"), ...f, likes: 0, createdAt: Date.now() }, ...notes]);
    setF({ mapId: "", title: "", body: "", tags: [] });
    setShowForm(false);
  };
  const remove = (id) => {
    if (confirm("このノートを削除しますか?")) setNotes(notes.filter((n) => n.id !== id));
  };
  const mapName = (id) => maps.find((m) => m.id === id)?.name || "不明なマップ";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <select style={{ ...inputStyle, width: 220 }} value={filterMapId}
          onChange={(e) => setFilterMapId(e.target.value)}>
          <option value="ALL">全マップ</option>
          {maps.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
        <button onClick={() => setShowForm(!showForm)} className="rounded px-4 py-2 ml-auto"
          style={{ background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700 }}>
          + ノートを書く
        </button>
      </div>
      <TagPicker all={NOTE_TAGS} selected={filterTags} onChange={setFilterTags} />
      <div className="mt-4" />
      {showForm && (
        <div className="rounded-lg p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.accent}66` }}>
          <label style={labelStyle}>マップ</label>
          <select style={inputStyle} value={f.mapId} onChange={(e) => setF({ ...f, mapId: e.target.value })}>
            <option value="">選択してください</option>
            {maps.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <label style={labelStyle}>タイトル</label>
          <input style={inputStyle} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })}
            placeholder="例: 初動はメイン建物に直行しない" />
          <label style={labelStyle}>本文</label>
          <textarea style={{ ...inputStyle, minHeight: 100 }} value={f.body}
            onChange={(e) => setF({ ...f, body: e.target.value })} />
          <label style={labelStyle}>タグ</label>
          <TagPicker all={NOTE_TAGS} selected={f.tags} onChange={(v) => setF({ ...f, tags: v })} />
          <button onClick={add} className="rounded px-4 py-2 mt-4"
            style={{ background: C.accent, color: "#fff", fontSize: 13, fontWeight: 700 }}>
            保存する
          </button>
        </div>
      )}
      <div className="grid gap-3">
        {list.map((n) => (
          <div key={n.id} className="rounded-lg p-4" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <div style={{ fontSize: 11, color: C.accentHi }}>{mapName(n.mapId)}</div>
                <div style={{ fontSize: 15, color: C.text, fontFamily: "'Shippori Mincho B1', serif" }}>{n.title}</div>
              </div>
              <button onClick={() => remove(n.id)} style={{ fontSize: 11, color: C.accentHi }}>削除</button>
            </div>
            <div className="flex flex-wrap gap-1.5 my-2">
              {n.tags.map((t) => <Tag key={t} t={t} />)}
              {n.isPreset && (
                <span className="rounded px-1.5 py-0.5" style={{ fontSize: 10, color: C.sub, border: `1px solid ${C.border}` }}>
                  プリセット
                </span>
              )}
            </div>
            <p style={{ fontSize: 13, color: "#cfcfcf", whiteSpace: "pre-wrap" }}>{n.body}</p>
          </div>
        ))}
        {list.length === 0 && (
          <div className="text-center py-10" style={{ color: C.faint, fontSize: 13 }}>
            条件に合うノートがありません。
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================
// アプリ本体
// ============================================================
const TABS = [
  { id: "builds", label: "パーク構成" },
  { id: "maps", label: "マップ & 覗きスポット" },
  { id: "notes", label: "立ち回りノート" },
];

export default function App() {
  const [tab, setTab] = useState("builds");
  const [builds, setBuilds] = useState(() => { seedOnce(); return load(KEYS.builds, []); });
  const [spots, setSpots] = useState(() => load(KEYS.spots, []));
  const [notes, setNotes] = useState(() => load(KEYS.notes, []));
  const [customMaps, setCustomMaps] = useState(() => load(KEYS.maps, []));
  const maps = useMemo(() => [...BASE_MAPS, ...customMaps], [customMaps]);

  useEffect(() => save(KEYS.builds, builds), [builds]);
  useEffect(() => save(KEYS.spots, spots), [spots]);
  useEffect(() => save(KEYS.notes, notes), [notes]);
  useEffect(() => save(KEYS.maps, customMaps), [customMaps]);

  const exportData = () => {
    const blob = new Blob(
      [JSON.stringify({ perkBuilds: builds, stalkSpots: spots, strategyNotes: notes, customMaps }, null, 2)],
      { type: "application/json" }
    );
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "stalklab-backup.json";
    a.click();
    URL.revokeObjectURL(a.href);
  };
  const importData = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const d = JSON.parse(reader.result);
        if (d.perkBuilds) setBuilds(d.perkBuilds);
        if (d.stalkSpots) setSpots(d.stalkSpots);
        if (d.strategyNotes) setNotes(d.strategyNotes);
        if (d.customMaps) setCustomMaps(d.customMaps);
        alert("インポートが完了しました");
      } catch {
        alert("ファイルの形式が正しくありません");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="min-h-screen" style={{ background: `radial-gradient(ellipse at 50% -10%, #1a0d0d 0%, ${C.bg} 55%)`, color: C.text }}>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <header className="text-center mb-6">
          <div style={{ fontSize: 11, letterSpacing: "0.5em", color: C.faint }}>GHOST FACE STRATEGY LAB</div>
          <h1 style={{ fontFamily: "'Shippori Mincho B1', serif", fontWeight: 800, fontSize: 36, lineHeight: 1.3, textShadow: "0 0 30px rgba(204,0,0,0.4)" }}>
            Stalk<span style={{ color: C.accentHi }}>Lab</span>
          </h1>
          <p style={{ fontSize: 12, color: C.sub, marginTop: 4 }}>
            ゴスフェ使いが、ゴスフェ使いのために作った攻略ラボ
          </p>
          <div style={{ fontSize: 11, color: C.faint, marginTop: 6 }}>
            Researcher: LegendObscura ・ v0.2 シングルユーザー版(データはこのブラウザに保存)
          </div>
        </header>

        <nav className="flex gap-1 mb-6 rounded-lg p-1" style={{ background: C.panel, border: `1px solid ${C.border}` }}>
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex-1 rounded px-2 py-2"
              style={{
                fontSize: 13,
                background: tab === t.id ? C.accent : "transparent",
                color: tab === t.id ? "#fff" : C.sub,
                fontWeight: tab === t.id ? 700 : 400,
              }}>
              {t.label}
            </button>
          ))}
        </nav>

        {tab === "builds" && <BuildsTab builds={builds} setBuilds={setBuilds} />}
        {tab === "maps" && <MapsTab maps={maps} onAddMap={(m) => setCustomMaps([...customMaps, m])} spots={spots} setSpots={setSpots} />}
        {tab === "notes" && <NotesTab notes={notes} setNotes={setNotes} maps={maps} />}

        <footer className="text-center mt-10 space-y-2">
          <div className="flex justify-center gap-3">
            <button onClick={exportData} style={{ fontSize: 11, color: C.sub, textDecoration: "underline" }}>
              データをエクスポート
            </button>
            <label style={{ fontSize: 11, color: C.sub, textDecoration: "underline", cursor: "pointer" }}>
              データをインポート
              <input type="file" accept="application/json" onChange={importData} style={{ display: "none" }} />
            </label>
          </div>
          <div style={{ fontSize: 10, color: C.faint }}>
            非公式ファンアプリ / Behaviour Interactive非公認 ・ パーク/アドオン名はゲーム内表記と要照合
          </div>
        </footer>
      </div>
    </div>
  );
}
