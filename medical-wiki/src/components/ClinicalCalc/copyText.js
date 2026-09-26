// クリップボードへのテキストコピー（ツール共通）
// 電子カルテの小窓（別オリジンの iframe）から開かれた場合、iframe 側に
// allow="clipboard-write" が無いと navigator.clipboard は権限エラーになる。
// その場合は textarea + execCommand('copy') で再試行する。
// 戻り値: 成功なら true、両方失敗なら false

function copyWithExecCommand(text) {
  if (typeof document === 'undefined') return false;
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.left = '0';
  ta.style.opacity = '0';
  ta.style.pointerEvents = 'none';
  document.body.appendChild(ta);
  const prevFocus = document.activeElement;
  ta.focus();
  ta.select();
  ta.setSelectionRange(0, text.length);
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  if (prevFocus && typeof prevFocus.focus === 'function') prevFocus.focus();
  return ok;
}

export default async function copyText(text) {
  if (!text) return false;
  if (typeof navigator !== 'undefined' && navigator.clipboard && typeof window !== 'undefined' && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // iframe の権限不足など → execCommand で再試行
    }
  }
  return copyWithExecCommand(text);
}

export const COPY_FAILED_MESSAGE = 'クリップボードへのコピーに失敗しました。テキストを手動で選択してコピーしてください。';
