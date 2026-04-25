/**
 * Overview Booster — フォローコード encode/decode
 *
 * Format: OB1-XXXX-XXXX-...-CC (Overview Booster v1)
 * - prefix: "OB"
 * - version: 1 (4bit)
 * - payload: bitfield (Crockford Base32)
 * - checksum: CRC-8 末尾2文字
 *
 * 含む: 疾患選択、薬剤クラス選択、lifestyle選択、restriction理由、患者ヘッダー主要フラグ
 * 含まない: スコア入力数値、患者識別情報
 */

import { OVERVIEW_DISEASES } from './overviewRegistry';
import { LIFESTYLE_OPTIONS, LIFESTYLE_RESTRICTION_REASONS } from './lifestyleOptions';

export const FOLLOWUP_CODE_VERSION = 1;
const PREFIX = 'OB';
// Crockford Base32 (0/O・1/I・L 区別不要)
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// ============= Bit Reader / Writer =============
class BitWriter {
  constructor() { this.bits = []; }
  write(value, nBits) {
    for (let i = nBits - 1; i >= 0; i--) {
      this.bits.push((value >> i) & 1);
    }
  }
  toBytes() {
    while (this.bits.length % 8 !== 0) this.bits.push(0);
    const bytes = [];
    for (let i = 0; i < this.bits.length; i += 8) {
      let b = 0;
      for (let j = 0; j < 8; j++) b = (b << 1) | this.bits[i + j];
      bytes.push(b);
    }
    return bytes;
  }
}

class BitReader {
  constructor(bytes) {
    this.bits = [];
    for (const b of bytes) {
      for (let i = 7; i >= 0; i--) this.bits.push((b >> i) & 1);
    }
    this.pos = 0;
  }
  read(nBits) {
    let v = 0;
    for (let i = 0; i < nBits; i++) {
      v = (v << 1) | (this.bits[this.pos++] || 0);
    }
    return v;
  }
}

// ============= Crockford Base32 =============
function bytesToBase32(bytes) {
  let bits = 0, value = 0, result = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      result += ALPHABET[(value >>> (bits - 5)) & 0x1f];
      bits -= 5;
    }
  }
  if (bits > 0) result += ALPHABET[(value << (5 - bits)) & 0x1f];
  return result;
}

function base32ToBytes(str) {
  const cleaned = str.toUpperCase().replace(/[^0-9A-Z]/g, '')
    .replace(/O/g, '0').replace(/I/g, '1').replace(/L/g, '1');
  let bits = 0, value = 0;
  const bytes = [];
  for (const ch of cleaned) {
    const idx = ALPHABET.indexOf(ch);
    if (idx < 0) throw new Error('Invalid character: ' + ch);
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return bytes;
}

// ============= CRC-8 (poly 0x07) =============
function crc8(bytes) {
  let crc = 0;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      crc = (crc & 0x80) ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc;
}

// ============= 疾患・薬剤クラスのインデックス =============
// disease index = OVERVIEW_DISEASES の順序 (固定、append-only)
// drug class index = 各疾患内の drugClasses 配列の順序 (各疾患内で 0-15、append-only)

function getDiseaseIndex(key) {
  return OVERVIEW_DISEASES.findIndex((d) => d.key === key);
}
function getDrugClassIndex(diseaseKey, drugClassId) {
  const d = OVERVIEW_DISEASES.find((x) => x.key === diseaseKey);
  if (!d) return -1;
  return d.drugClasses.findIndex((c) => c.id === drugClassId);
}
function getDrugClassByIndex(diseaseKey, idx) {
  const d = OVERVIEW_DISEASES.find((x) => x.key === diseaseKey);
  return d?.drugClasses[idx];
}

// ============= Encode =============
export function encodeFollowupCode(state) {
  try {
    const bw = new BitWriter();
    bw.write(FOLLOWUP_CODE_VERSION, 4);

    // patient header flags 4bit (pregnancy/lactation/frail/elderly_75)
    const ph = state.patientHeader || {};
    bw.write(ph.co_pregnancy ? 1 : 0, 1);
    bw.write(ph.co_lactation ? 1 : 0, 1);
    bw.write(ph.co_frail ? 1 : 0, 1);
    bw.write(ph.co_elderly_75 ? 1 : 0, 1);

    // disease_mask N bit (N = OVERVIEW_DISEASES.length, 現在11)
    const N = OVERVIEW_DISEASES.length;
    let mask = 0;
    OVERVIEW_DISEASES.forEach((d, i) => {
      if ((state.selectedDiseases || []).includes(d.key)) mask |= (1 << i);
    });
    bw.write(mask, N);

    // 各選択疾患について drug_mask (16bit) + lifestyle (2bit) + restriction (3bit)
    OVERVIEW_DISEASES.forEach((d, i) => {
      if (!(mask & (1 << i))) return;
      const sel = state.selectionsByDisease?.[d.key] || {};
      let drugMask = 0;
      (sel.drugIds || []).forEach((id) => {
        const idx = getDrugClassIndex(d.key, id);
        if (idx >= 0 && idx < 16) drugMask |= (1 << idx);
      });
      bw.write(drugMask, 16);

      // lifestyle: 0=未選択, 1=食事, 2=食事+運動, 3=制限考慮
      let ls = 0;
      if (sel.lifestyle === 'lifestyle_diet') ls = 1;
      else if (sel.lifestyle === 'lifestyle_diet_exercise') ls = 2;
      else if (sel.lifestyle === 'lifestyle_diet_exercise_restricted') ls = 3;
      bw.write(ls, 2);

      // restriction reason: 0=未指定, 1-7 (LIFESTYLE_RESTRICTION_REASONS index)
      let rr = 0;
      if (sel.restriction) {
        const idx = LIFESTYLE_RESTRICTION_REASONS.findIndex((r) => r.id === sel.restriction);
        if (idx >= 0) rr = idx + 1;
      }
      bw.write(rr, 3);
    });

    // CRC8
    const bytes = bw.toBytes();
    const crc = crc8(bytes);
    bytes.push(crc);

    const base32 = bytesToBase32(bytes);
    // 4桁ごとにハイフン
    const grouped = base32.match(/.{1,4}/g).join('-');
    return `${PREFIX}${FOLLOWUP_CODE_VERSION}-${grouped}`;
  } catch (e) {
    console.error('encodeFollowupCode error:', e);
    return null;
  }
}

// ============= Decode =============
export function decodeFollowupCode(code) {
  try {
    const cleaned = (code || '').replace(/\s/g, '').toUpperCase();
    const m = cleaned.match(/^OB(\d+)-(.+)$/);
    if (!m) return { success: false, error: '形式不正: OBX-XXXX-... の形式で入力してください' };
    const version = parseInt(m[1], 10);
    if (version !== FOLLOWUP_CODE_VERSION) {
      // 後方互換: 古いバージョンは partial 復元、新しいバージョンは警告
      if (version > FOLLOWUP_CODE_VERSION) {
        return { success: false, error: `新形式コード (v${version}) です。本端末は v${FOLLOWUP_CODE_VERSION} まで対応` };
      }
    }
    const base32 = m[2].replace(/-/g, '');
    const bytes = base32ToBytes(base32);
    if (bytes.length < 2) return { success: false, error: 'コードが短すぎます' };
    const dataBytes = bytes.slice(0, -1);
    const expectedCrc = bytes[bytes.length - 1];
    const actualCrc = crc8(dataBytes);
    if (expectedCrc !== actualCrc) {
      return { success: false, error: 'コード破損 (チェックサム不一致)。手入力でやり直してください' };
    }

    const br = new BitReader(dataBytes);
    const v = br.read(4);
    if (v !== FOLLOWUP_CODE_VERSION) return { success: false, error: 'バージョン不一致' };

    const patientHeader = {
      co_pregnancy:   !!br.read(1),
      co_lactation:   !!br.read(1),
      co_frail:       !!br.read(1),
      co_elderly_75:  !!br.read(1),
    };

    const N = OVERVIEW_DISEASES.length;
    const mask = br.read(N);
    const selectedDiseases = [];
    const selectionsByDisease = {};

    OVERVIEW_DISEASES.forEach((d, i) => {
      if (!(mask & (1 << i))) return;
      selectedDiseases.push(d.key);
      const drugMask = br.read(16);
      const ls = br.read(2);
      const rr = br.read(3);

      const drugIds = [];
      for (let bit = 0; bit < 16; bit++) {
        if (drugMask & (1 << bit)) {
          const dc = getDrugClassByIndex(d.key, bit);
          if (dc) drugIds.push(dc.id);
        }
      }

      const lifestyleMap = ['', 'lifestyle_diet', 'lifestyle_diet_exercise', 'lifestyle_diet_exercise_restricted'];
      const lifestyle = lifestyleMap[ls] || '';
      const restriction = rr > 0 ? LIFESTYLE_RESTRICTION_REASONS[rr - 1]?.id : null;

      selectionsByDisease[d.key] = { drugIds, lifestyle, restriction };
    });

    return {
      success: true,
      version: v,
      data: { patientHeader, selectedDiseases, selectionsByDisease },
      warnings: [],
    };
  } catch (e) {
    return { success: false, error: 'decode 失敗: ' + e.message };
  }
}
