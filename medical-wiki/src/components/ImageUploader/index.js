import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.css';

const CLOUD_NAME = 'dpyh1wsn8';
const UPLOAD_PRESET = 'medical-wiki';

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
      thumb: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_200,h_150/${r.public_id}.${r.format}`,
      medium: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400/${r.public_id}.${r.format}`,
      large: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200/${r.public_id}.${r.format}`,
      format: r.format,
    }));
  } catch {
    return [];
  }
}

/** 非表示リスト (localStorage) */
function getHidden(docId) {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(`wiki_hidden_${docId}`) || '[]');
  } catch { return []; }
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

/** featured (localStorage) */
function getFeatured(docId) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`wiki_feat_${docId}`);
}
function setFeaturedStorage(docId, publicId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`wiki_feat_${docId}`, publicId);
  notify(docId);
}

/** コンポーネント間の同期イベント */
function notify(docId) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('wiki-image-update', { detail: { docId } }));
  }
}

/** 可視画像のみフィルタ */
function visibleImages(images, docId) {
  const hidden = getHidden(docId);
  return images.filter((img) => !hidden.includes(img.publicId));
}

// ─────────────────────────────────────────────
// 右カラム用: アイコン画像 + アップロード
// ─────────────────────────────────────────────
export default function ImageUploader({ docId }) {
  const [allImages, setAllImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  const images = visibleImages(allImages, docId);
  const featId = getFeatured(docId);
  const featImg = images.find((i) => i.publicId === featId) || images[0];

  const load = () => {
    fetchCloudinaryImages(docId).then(setAllImages);
  };

  useEffect(() => { if (docId) load(); }, [docId]);

  useEffect(() => {
    const handler = (e) => { if (e.detail?.docId === docId) load(); };
    window.addEventListener('wiki-image-update', handler);
    return () => window.removeEventListener('wiki-image-update', handler);
  }, [docId]);

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
        thumb: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_200,h_150/${pid}.${fmt}`,
        medium: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400/${pid}.${fmt}`,
        large: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200/${pid}.${fmt}`,
        // secure_url をフォールバックに使用
        url: data.secure_url,
        format: fmt,
      };
      setAllImages((prev) => [...prev, newImg]);
      if (images.length === 0) setFeaturedStorage(docId, pid);
      else notify(docId);
      setError('');
    } catch (err) {
      console.error('Upload error:', err);
      setError(`アップロード失敗: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    const f = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
    if (f) uploadImage(f);
  }, [docId, allImages]);

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

  return (
    <div className={styles.uploader}>
      {featImg && (
        <div className={styles.iconPreview}>
          <img src={featImg.url || featImg.medium} alt="" className={styles.iconImage} />
        </div>
      )}
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
    </div>
  );
}

// ─────────────────────────────────────────────
// 本文下用: 大きな画像 + サムネイル + 削除
// ─────────────────────────────────────────────
export function ImageGallery({ docId }) {
  const [allImages, setAllImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showManage, setShowManage] = useState(false);
  const [, forceUpdate] = useState(0);

  const images = visibleImages(allImages, docId);

  const load = async () => {
    setLoading(true);
    const imgs = await fetchCloudinaryImages(docId);
    setAllImages(imgs);
    const vis = imgs.filter((i) => !getHidden(docId).includes(i.publicId));
    const feat = getFeatured(docId);
    if (feat && vis.find((i) => i.publicId === feat)) {
      setSelectedId(feat);
    } else if (vis.length > 0) {
      setSelectedId(vis[0].publicId);
    }
    setLoading(false);
  };

  useEffect(() => { if (docId) load(); }, [docId]);

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.docId === docId) {
        load();
        forceUpdate((n) => n + 1);
      }
    };
    window.addEventListener('wiki-image-update', handler);
    return () => window.removeEventListener('wiki-image-update', handler);
  }, [docId]);

  const selectImage = (publicId) => {
    setSelectedId(publicId);
    setFeaturedStorage(docId, publicId);
  };

  const hideImage = (publicId) => {
    if (!window.confirm('この画像を非表示にしますか？')) return;
    addHidden(docId, publicId);
    forceUpdate((n) => n + 1);
    // 選択中の画像が消えた場合
    if (selectedId === publicId) {
      const remaining = visibleImages(allImages, docId).filter((i) => i.publicId !== publicId);
      setSelectedId(remaining.length > 0 ? remaining[0].publicId : null);
    }
  };

  const restoreImage = (publicId) => {
    removeHidden(docId, publicId);
    forceUpdate((n) => n + 1);
  };

  const selectedImg = images.find((i) => i.publicId === selectedId) || images[0];
  const hiddenList = getHidden(docId);
  const hiddenImages = allImages.filter((i) => hiddenList.includes(i.publicId));

  if (loading) return null;
  if (images.length === 0 && hiddenImages.length === 0) return null;

  return (
    <div className={styles.gallery}>
      {/* 大きな画像表示 */}
      {selectedImg && (
        <div className={styles.largeView}>
          <img src={selectedImg.large} alt="" className={styles.largeImage} />
        </div>
      )}

      {/* サムネイル選択 + 削除ボタン */}
      {images.length > 0 && (
        <div className={styles.thumbRow}>
          {images.map((img) => (
            <div
              key={img.publicId}
              className={`${styles.thumbCard} ${img.publicId === selectedImg?.publicId ? styles.thumbActive : ''}`}
            >
              <img
                src={img.thumb} alt=""
                className={styles.thumbImg}
                loading="lazy"
                onClick={() => selectImage(img.publicId)}
              />
              <button
                className={styles.deleteBtn}
                onClick={(e) => { e.stopPropagation(); hideImage(img.publicId); }}
                title="非表示にする"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 非表示画像の復元 */}
      {hiddenImages.length > 0 && (
        <div className={styles.manageSection}>
          <button
            className={styles.manageBtn}
            onClick={() => setShowManage((v) => !v)}
          >
            {showManage ? '▲ 閉じる' : `非表示の画像 (${hiddenImages.length})`}
          </button>
          {showManage && (
            <div className={styles.thumbRow}>
              {hiddenImages.map((img) => (
                <div key={img.publicId} className={`${styles.thumbCard} ${styles.thumbHidden}`}>
                  <img src={img.thumb} alt="" className={styles.thumbImg} loading="lazy" />
                  <button
                    className={styles.restoreBtn}
                    onClick={() => restoreImage(img.publicId)}
                    title="復元する"
                  >
                    ↩
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
