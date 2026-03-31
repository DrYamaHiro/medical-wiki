import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.css';

const CLOUD_NAME = 'dpyh1wsn8';
const UPLOAD_PRESET = 'medical-wiki';

/** Cloudinary URL ヘルパー */
function imgUrl(publicId, fmt, transform) {
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicId}.${fmt}`;
}

/** Cloudinary からタグ指定で画像一覧取得 */
async function fetchCloudinaryImages(docId) {
  try {
    const res = await fetch(
      `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${docId}.json`
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.resources || []).map((r) => ({
      publicId: r.public_id,
      thumb: imgUrl(r.public_id, r.format, 'c_fill,w_200,h_150,q_auto'),
      display: imgUrl(r.public_id, r.format, 'q_auto:best'),
      format: r.format,
    }));
  } catch {
    return [];
  }
}

// ── localStorage ヘルパー ──

function getHidden(docId) {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(`wiki_hidden_${docId}`) || '[]'); }
  catch { return []; }
}
function addHidden(docId, publicId) {
  const list = getHidden(docId);
  if (!list.includes(publicId)) list.push(publicId);
  localStorage.setItem(`wiki_hidden_${docId}`, JSON.stringify(list));
  notify(docId);
}
function removeHidden(docId, publicId) {
  const list = getHidden(docId).filter((id) => id !== publicId);
  localStorage.setItem(`wiki_hidden_${docId}`, JSON.stringify(list));
  notify(docId);
}

function getFeatured(docId) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`wiki_feat_${docId}`);
}
function setFeaturedStorage(docId, publicId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`wiki_feat_${docId}`, publicId);
  notify(docId);
}

/** サムネイル順序 (localStorage) */
function getOrder(docId) {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(`wiki_order_${docId}`) || '[]'); }
  catch { return []; }
}
function saveOrder(docId, order) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`wiki_order_${docId}`, JSON.stringify(order));
  }
  notify(docId);
}

function notify(docId) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wiki-image-update', { detail: { docId } }));
  }
}

/** 可視画像のみ + 順序適用 */
function orderedVisibleImages(images, docId) {
  const hidden = getHidden(docId);
  const visible = images.filter((img) => !hidden.includes(img.publicId));
  const order = getOrder(docId);
  if (order.length === 0) return visible;
  const ordered = [];
  for (const id of order) {
    const img = visible.find((i) => i.publicId === id);
    if (img) ordered.push(img);
  }
  // order に含まれない新規画像を末尾に追加
  for (const img of visible) {
    if (!order.includes(img.publicId)) ordered.push(img);
  }
  return ordered;
}

// ─────────────────────────────────────────────
// 右カラム: メイン画像 + サムネイル + アップロード
// ─────────────────────────────────────────────
export default function ImageUploader({ docId }) {
  const [allImages, setAllImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);
  const [dropIdx, setDropIdx] = useState(null);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const images = orderedVisibleImages(allImages, docId);
  const featId = getFeatured(docId);
  const featImg = images.find((i) => i.publicId === featId) || images[0];

  const load = () => fetchCloudinaryImages(docId).then(setAllImages);

  useEffect(() => { if (docId) load(); }, [docId]);
  useEffect(() => {
    const handler = (e) => { if (e.detail?.docId === docId) load(); };
    window.addEventListener('wiki-image-update', handler);
    return () => window.removeEventListener('wiki-image-update', handler);
  }, [docId]);

  // ── アップロード ──
  const uploadImage = async (file) => {
    if (!file?.type.startsWith('image/')) { setError('画像ファイルのみ'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('10MB以下にしてください'); return; }
    setUploading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('upload_preset', UPLOAD_PRESET);
      fd.append('folder', `medical-wiki/${docId}`);
      fd.append('tags', docId);
      // return_delete_token は upload preset 側で設定済み
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: fd }
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error?.message || `${res.status}`);
      }
      const data = await res.json();
      const pid = data.public_id;
      const fmt = data.format || 'png';
      const newImg = {
        publicId: pid,
        thumb: imgUrl(pid, fmt, 'c_fill,w_200,h_150,q_auto'),
        display: data.secure_url,
        format: fmt,
      };
      setAllImages((prev) => [...prev, newImg]);
      if (images.length === 0) setFeaturedStorage(docId, pid);
      else notify(docId);
    } catch (err) {
      console.error('Upload error:', err);
      setError(`アップロード失敗: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  // ── ドラッグ&ドロップ (ファイル) ──
  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
    if (f) uploadImage(f);
  }, [docId, allImages]);

  // ── クリップボード ──
  useEffect(() => {
    const handlePaste = (e) => {
      if (!dropRef.current) return;
      const rect = dropRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      const item = Array.from(e.clipboardData?.items || []).find((i) => i.type.startsWith('image/'));
      if (item) { e.preventDefault(); uploadImage(item.getAsFile()); }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [docId, allImages]);

  // ── サムネイル並び替え (ドラッグ) ──
  const handleThumbDragStart = (idx) => setDragIdx(idx);
  const handleThumbDragOver = (e, idx) => { e.preventDefault(); setDropIdx(idx); };
  const handleThumbDragEnd = () => {
    if (dragIdx !== null && dropIdx !== null && dragIdx !== dropIdx) {
      const newOrder = images.map((i) => i.publicId);
      const [moved] = newOrder.splice(dragIdx, 1);
      newOrder.splice(dropIdx, 0, moved);
      saveOrder(docId, newOrder);
    }
    setDragIdx(null);
    setDropIdx(null);
  };

  // ── 非表示 ──
  const hideImage = (e, publicId) => {
    e.stopPropagation();
    if (!window.confirm('この画像を非表示にしますか？')) return;
    addHidden(docId, publicId);
    if (featId === publicId) {
      const remaining = images.filter((i) => i.publicId !== publicId);
      if (remaining.length > 0) setFeaturedStorage(docId, remaining[0].publicId);
    }
  };

  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <div className={styles.uploader}>
      {/* メイン画像 (高解像度・クリックで拡大) */}
      {featImg && (
        <div className={styles.mainPreview} onClick={() => setLightboxOpen(true)} style={{cursor: 'pointer'}}>
          <img src={featImg.display} alt="" className={styles.mainImage} />
        </div>
      )}

      {/* Lightbox オーバーレイ */}
      {lightboxOpen && featImg && (
        <div className={styles.lightboxOverlay} onClick={() => setLightboxOpen(false)}>
          <img src={featImg.display} alt="" className={styles.lightboxImage} onClick={(e) => e.stopPropagation()} />
          <button className={styles.lightboxClose} onClick={() => setLightboxOpen(false)}>✕</button>
        </div>
      )}

      {/* サムネイル一覧 (並び替え可能) */}
      {images.length >= 1 && (
        <div className={styles.thumbRow}>
          {images.map((img, idx) => (
            <div
              key={img.publicId}
              className={`${styles.thumbCard} ${img.publicId === featImg?.publicId ? styles.thumbActive : ''} ${dropIdx === idx ? styles.thumbDropTarget : ''}`}
              draggable
              onDragStart={() => handleThumbDragStart(idx)}
              onDragOver={(e) => handleThumbDragOver(e, idx)}
              onDragEnd={handleThumbDragEnd}
              onClick={() => setFeaturedStorage(docId, img.publicId)}
              title="クリックで選択 / ドラッグで並び替え"
            >
              <img src={img.thumb} alt="" className={styles.thumbImg} loading="lazy" />
              <button
                className={styles.deleteBtn}
                onClick={(e) => hideImage(e, img.publicId)}
                title="非表示"
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* 1枚だけの場合の削除ボタン */}
      {images.length === 1 && (
        <button
          className={styles.singleDeleteBtn}
          onClick={(e) => hideImage(e, images[0].publicId)}
        >非表示にする</button>
      )}

      {/* アップロードゾーン */}
      <div
        ref={dropRef}
        className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploading : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
      >
        {uploading
          ? <span className={styles.dropText}>アップロード中...</span>
          : <span className={styles.dropText}>画像追加: ドロップ / クリック / Ctrl+V</span>
        }
        <input ref={fileInputRef} type="file" accept="image/*"
          onChange={(e) => { if (e.target.files?.[0]) uploadImage(e.target.files[0]); e.target.value = ''; }}
          className={styles.hiddenInput} />
      </div>
      {error && <div className={styles.error}>{error}</div>}

      {/* 非表示画像: 復元 / 完全削除 */}
      {(() => {
        const hidden = getHidden(docId);
        const hiddenImgs = allImages.filter((i) => hidden.includes(i.publicId));
        if (hiddenImgs.length === 0) return null;

        const hardDelete = (publicId) => {
          window.open('https://console.cloudinary.com/console/media_library', '_blank');
        };

        return (
          <details className={styles.hiddenSection}>
            <summary className={styles.hiddenSummary}>非表示の画像 ({hiddenImgs.length})</summary>
            {hiddenImgs.map((img) => (
              <div key={img.publicId} className={styles.hiddenItem}>
                <img src={img.thumb} alt="" className={styles.hiddenThumb} loading="lazy" />
                <div className={styles.hiddenActions}>
                  <button
                    className={styles.restoreBtnText}
                    onClick={() => removeHidden(docId, img.publicId)}
                  >↩ 復元</button>
                  <button
                    className={styles.hardDeleteBtn}
                    onClick={() => hardDelete(img.publicId)}
                  >🗑 完全削除</button>
                </div>
              </div>
            ))}
          </details>
        );
      })()}
    </div>
  );
}

// ─────────────────────────────────────────────
// 本文下: 大きな画像 + サムネイル選択
// ─────────────────────────────────────────────
export function ImageGallery({ docId }) {
  const [allImages, setAllImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [, forceUpdate] = useState(0);

  const load = async () => {
    setLoading(true);
    const imgs = await fetchCloudinaryImages(docId);
    setAllImages(imgs);
    setLoading(false);
  };

  useEffect(() => { if (docId) load(); }, [docId]);
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.docId === docId) { load(); forceUpdate((n) => n + 1); }
    };
    window.addEventListener('wiki-image-update', handler);
    return () => window.removeEventListener('wiki-image-update', handler);
  }, [docId]);

  const images = orderedVisibleImages(allImages, docId);
  // 下のギャラリーは独自の選択状態（右上とは独立）
  const selectedImg = images.find((i) => i.publicId === selectedId) || images[0];

  const selectImage = (publicId) => {
    setSelectedId(publicId);
  };

  const [galleryLightbox, setGalleryLightbox] = useState(false);

  if (loading || images.length === 0) return null;

  return (
    <div className={styles.gallery}>
      {selectedImg && (
        <div className={styles.largeView} onClick={() => setGalleryLightbox(true)} style={{cursor: 'pointer'}}>
          <img src={selectedImg.display} alt="" className={styles.largeImage} />
        </div>
      )}

      {/* Gallery Lightbox */}
      {galleryLightbox && selectedImg && (
        <div className={styles.lightboxOverlay} onClick={() => setGalleryLightbox(false)}>
          <img src={selectedImg.display} alt="" className={styles.lightboxImage} onClick={(e) => e.stopPropagation()} />
          <button className={styles.lightboxClose} onClick={() => setGalleryLightbox(false)}>✕</button>
        </div>
      )}
      {images.length > 1 && (
        <div className={styles.galleryThumbRow}>
          {images.map((img) => (
            <div
              key={img.publicId}
              className={`${styles.galleryThumb} ${img.publicId === selectedImg?.publicId ? styles.galleryThumbActive : ''}`}
              onClick={() => selectImage(img.publicId)}
            >
              <img src={img.thumb} alt="" className={styles.galleryThumbImg} loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
