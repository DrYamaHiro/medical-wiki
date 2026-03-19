import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.css';

const CLOUD_NAME = 'dpyh1wsn8';
const UPLOAD_PRESET = 'medical-wiki';

/**
 * Cloudinary 画像アップロード＆ギャラリーコンポーネント
 *
 * - 上部: メイン画像（1枚）を大きく表示
 * - 下部: ギャラリー（制限なし）＋アップロード
 * - 認証不要 — unsigned upload preset 使用
 *
 * Props:
 *   docId - ドキュメントID (例: "j00-common-cold")
 */
export default function ImageUploader({ docId }) {
  const [images, setImages] = useState([]);
  const [featuredId, setFeaturedId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loading, setLoading] = useState(true);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // 初期化: 画像一覧取得 + featured 復元
  useEffect(() => {
    if (docId) {
      fetchImages();
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(`wiki_featured_${docId}`);
        if (saved) setFeaturedId(saved);
      }
    }
  }, [docId]);

  /** Cloudinary Resource List API で既存画像を取得 */
  const fetchImages = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://res.cloudinary.com/${CLOUD_NAME}/image/list/${docId}.json`
      );
      if (res.status === 404) {
        setImages([]);
        return;
      }
      if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
      const data = await res.json();
      const imgs = (data.resources || []).map((r) => ({
        publicId: r.public_id,
        url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${r.public_id}.${r.format}`,
        thumb: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_200,h_150/${r.public_id}.${r.format}`,
        full: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_800/${r.public_id}.${r.format}`,
        format: r.format,
        createdAt: r.created_at,
      }));
      setImages(imgs);

      // featured が未設定 or 存在しない場合、最初の画像を設定
      if (imgs.length > 0) {
        const savedFeat = typeof window !== 'undefined'
          ? localStorage.getItem(`wiki_featured_${docId}`)
          : null;
        if (!savedFeat || !imgs.find((i) => i.publicId === savedFeat)) {
          setFeaturedId(imgs[0].publicId);
        }
      }
    } catch (err) {
      // 404 はまだ画像が無いだけなのでエラー表示しない
      if (!err.message.includes('404')) {
        console.error('Failed to fetch images:', err);
      }
      setImages([]);
    } finally {
      setLoading(false);
    }
  };

  /** Cloudinary Unsigned Upload */
  const uploadImage = async (file) => {
    if (!file || !file.type.startsWith('image/')) {
      setError('画像ファイルのみアップロード可能です。');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('ファイルサイズは10MB以下にしてください。');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', `medical-wiki/${docId}`);
      formData.append('tags', docId);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error?.message || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      const newImg = {
        publicId: data.public_id,
        url: data.secure_url,
        thumb: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_200,h_150/${data.public_id}.${data.format}`,
        full: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/w_800/${data.public_id}.${data.format}`,
        format: data.format,
        createdAt: data.created_at,
      };

      setImages((prev) => [...prev, newImg]);

      // 最初の1枚なら自動でメインに設定
      if (images.length === 0) {
        selectFeatured(data.public_id);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(`アップロード失敗: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  /** メイン画像を選択 (localStorage に保存) */
  const selectFeatured = (publicId) => {
    setFeaturedId(publicId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`wiki_featured_${docId}`, publicId);
    }
  };

  // ドラッグ&ドロップ
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/')
    );
    if (files.length > 0) uploadImage(files[0]);
  }, [docId, images]);

  // クリップボード貼り付け
  useEffect(() => {
    const handlePaste = (e) => {
      if (!dropRef.current) return;
      const rect = dropRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      const items = Array.from(e.clipboardData?.items || []);
      const imgItem = items.find((i) => i.type.startsWith('image/'));
      if (imgItem) {
        e.preventDefault();
        uploadImage(imgItem.getAsFile());
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [docId, images]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  };

  // メイン画像
  const featuredImg = images.find((i) => i.publicId === featuredId) || images[0];

  return (
    <div className={styles.container}>
      {/* ── メイン画像 (上部) ── */}
      {featuredImg && (
        <div className={styles.featured}>
          <img
            src={featuredImg.full}
            alt="メイン画像"
            className={styles.featuredImage}
          />
        </div>
      )}

      {/* ── ギャラリー & アップロード (下部) ── */}
      <button
        className={styles.toggleBtn}
        onClick={() => setGalleryOpen((v) => !v)}
      >
        {galleryOpen ? '▲ 閉じる' : `▼ 画像 (${images.length})`}
      </button>

      {galleryOpen && (
        <div className={styles.panel}>
          {/* ドロップゾーン */}
          <div
            ref={dropRef}
            className={`${styles.dropZone} ${dragOver ? styles.dragOver : ''} ${uploading ? styles.uploading : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {uploading ? (
              <span className={styles.spinner}>アップロード中...</span>
            ) : (
              <span className={styles.dropText}>
                画像をドロップ / クリック / Ctrl+V
              </span>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className={styles.hiddenInput}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}
          {loading && <div className={styles.info}>読み込み中...</div>}
          {!loading && images.length === 0 && (
            <div className={styles.info}>画像なし</div>
          )}

          {/* サムネイルグリッド */}
          <div className={styles.grid}>
            {images.map((img) => (
              <div
                key={img.publicId}
                className={`${styles.card} ${img.publicId === featuredImg?.publicId ? styles.cardActive : ''}`}
                onClick={() => selectFeatured(img.publicId)}
                title="クリックでメイン画像に設定"
              >
                <img
                  src={img.thumb}
                  alt=""
                  className={styles.thumb}
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
