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
    if (res.status === 404) return [];
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

/** featured を localStorage に保存/取得 */
function getFeatured(docId) {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(`wiki_feat_${docId}`);
}
function setFeaturedStorage(docId, publicId) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(`wiki_feat_${docId}`, publicId);
  // 他コンポーネントへ通知
  window.dispatchEvent(new CustomEvent('wiki-image-update', { detail: { docId } }));
}

/**
 * 右カラム用: アイコン的小画像 + アップロードUI
 */
export default function ImageUploader({ docId }) {
  const [images, setImages] = useState([]);
  const [featuredId, setFeaturedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  useEffect(() => {
    if (!docId) return;
    setFeaturedId(getFeatured(docId));
    fetchCloudinaryImages(docId).then((imgs) => {
      setImages(imgs);
      if (imgs.length > 0 && !getFeatured(docId)) {
        setFeaturedId(imgs[0].publicId);
      }
    });
  }, [docId]);

  // 他コンポーネントからの更新通知を受信
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.docId === docId) {
        setFeaturedId(getFeatured(docId));
        fetchCloudinaryImages(docId).then(setImages);
      }
    };
    window.addEventListener('wiki-image-update', handler);
    return () => window.removeEventListener('wiki-image-update', handler);
  }, [docId]);

  const uploadImage = async (file) => {
    if (!file?.type.startsWith('image/')) {
      setError('画像ファイルのみ');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('10MB以下にしてください');
      return;
    }
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
      const newImg = {
        publicId: data.public_id,
        thumb: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_200,h_150/${data.public_id}.${data.format}`,
        medium: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_400/${data.public_id}.${data.format}`,
        large: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_1200/${data.public_id}.${data.format}`,
        format: data.format,
      };
      const updated = [...images, newImg];
      setImages(updated);
      if (images.length === 0) {
        setFeaturedId(data.public_id);
        setFeaturedStorage(docId, data.public_id);
      }
      // 下のギャラリーにも通知
      window.dispatchEvent(new CustomEvent('wiki-image-update', { detail: { docId } }));
    } catch (err) {
      setError(`失敗: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = useCallback((e) => { e.preventDefault(); setDragOver(true); }, []);
  const handleDragLeave = useCallback((e) => { e.preventDefault(); setDragOver(false); }, []);
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const f = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
    if (f) uploadImage(f);
  }, [docId, images]);

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
  }, [docId, images]);

  const featImg = images.find((i) => i.publicId === featuredId) || images[0];

  return (
    <div className={styles.uploader}>
      {featImg && (
        <div className={styles.iconPreview}>
          <img src={featImg.medium} alt="" className={styles.iconImage} />
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

/**
 * 本文下用: 大きな画像表示 + サムネイル選択
 */
export function ImageGallery({ docId }) {
  const [images, setImages] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const imgs = await fetchCloudinaryImages(docId);
    setImages(imgs);
    const feat = getFeatured(docId);
    if (feat && imgs.find((i) => i.publicId === feat)) {
      setSelectedId(feat);
    } else if (imgs.length > 0) {
      setSelectedId(imgs[0].publicId);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (docId) load();
  }, [docId]);

  // アップロード通知を受信してリフレッシュ
  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.docId === docId) load();
    };
    window.addEventListener('wiki-image-update', handler);
    return () => window.removeEventListener('wiki-image-update', handler);
  }, [docId]);

  const selectImage = (publicId) => {
    setSelectedId(publicId);
    setFeaturedStorage(docId, publicId);
  };

  const selectedImg = images.find((i) => i.publicId === selectedId) || images[0];

  if (loading) return null;
  if (images.length === 0) return null;

  return (
    <div className={styles.gallery}>
      {/* 大きな画像表示 */}
      {selectedImg && (
        <div className={styles.largeView}>
          <img src={selectedImg.large} alt="" className={styles.largeImage} />
        </div>
      )}

      {/* サムネイル選択 */}
      {images.length > 1 && (
        <div className={styles.thumbRow}>
          {images.map((img) => (
            <div
              key={img.publicId}
              className={`${styles.thumbCard} ${img.publicId === selectedImg?.publicId ? styles.thumbActive : ''}`}
              onClick={() => selectImage(img.publicId)}
            >
              <img src={img.thumb} alt="" className={styles.thumbImg} loading="lazy" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
