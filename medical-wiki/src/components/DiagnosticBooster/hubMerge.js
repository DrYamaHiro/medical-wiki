// Hub mode merge utilities (used by DiagnosticBoosterHub)
// 各 booster ごとにネイティブ context で calcScore → 統合時に max-score dedup

// alias map: variant IDs that should merge as one canonical disease in hub view
const DISEASE_ALIASES = {
  acs_epigastric: 'acs',
  acs_syncope: 'acs',
  tuberculosis_ln: 'tuberculosis',
  gca: 'gca_pmr',
  pmr: 'gca_pmr',
};
export const canonical = (id) => DISEASE_ALIASES[id] || id;

// 1. SYMPTOMS union (first-occurrence wins, max weight)
export function unionSymptoms(boosterDataModules) {
  const map = new Map();
  for (const mod of boosterDataModules) {
    for (const s of (mod.SYMPTOMS || [])) {
      const cur = map.get(s.id);
      if (!cur) { map.set(s.id, { ...s }); continue; }
      if ((s.weight ?? 0) > (cur.weight ?? 0)) cur.weight = s.weight;
    }
  }
  return Array.from(map.values());
}

// 2. FINDINGS union (merge triggers arrays, max weight)
export function unionFindings(boosterDataModules) {
  const map = new Map();
  for (const mod of boosterDataModules) {
    for (const f of (mod.FINDINGS || [])) {
      const cur = map.get(f.id);
      if (!cur) { map.set(f.id, { ...f, triggers: [...(f.triggers || [])] }); continue; }
      if ((f.weight ?? 0) > (cur.weight ?? 0)) cur.weight = f.weight;
      cur.triggers = Array.from(new Set([...(cur.triggers || []), ...(f.triggers || [])]));
    }
  }
  return Array.from(map.values());
}

// 3. DIFFERENTIALS merge with max-score dedup, _sourceBoosters preserved
export function mergeDifferentials(rankedByBooster) {
  const best = new Map();
  for (const [boosterKey, list] of Object.entries(rankedByBooster)) {
    for (const d of list) {
      const cid = canonical(d.id);
      const prev = best.get(cid);
      if (!prev || d._score > prev._score) {
        best.set(cid, {
          ...d,
          id: cid,
          _sourceBoosters: Array.from(new Set([...(prev?._sourceBoosters || []), boosterKey])),
        });
      } else {
        prev._sourceBoosters = Array.from(new Set([...(prev._sourceBoosters || []), boosterKey]));
      }
    }
  }
  return Array.from(best.values()).sort((a, b) => b._score - a._score);
}

// 4. RED_FLAGS dedup by message + sorted-conditions key
export function unionRedFlags(boosterDataModules) {
  const seen = new Map();
  for (const mod of boosterDataModules) {
    for (const rf of (mod.RED_FLAGS || [])) {
      const key = `${rf.message}|${[...(rf.conditions || [])].sort().join(',')}`;
      if (!seen.has(key)) seen.set(key, { ...rf });
    }
  }
  return Array.from(seen.values());
}
