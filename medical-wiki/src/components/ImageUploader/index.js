import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from './styles.module.css';

const REPO_OWNER = 'DrYamaHiro';
const REPO_NAME = 'medical-wiki';
const BRANCH = 'master';
const IMG_BASE_PATH = 'medical-wiki/static/img/wiki';
const FEATURED_FILE = '_featured.json';

/**
 * 画像アップロード＆メイン画像選択コンポーネント
 *
 * - 上部: メイン画像（1枚）を大きく表示
 * - 下部: ギャラリー（全画像）＋アップロード＋メイン選択
 *
 * Props:
 *   docId - ドキュメントID (例: "j00-common-cold")
 */
export default function ImageUploader({ docId }) {
  const [token, setToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);
  const [images, setImages] = useState([]);
  const [featuredName, setFeaturedName] = useState(null);
  const [featuredSha, setFeaturedSha] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [loadingImages, setLoadingImages] = useState(false);
  const [expandGallery, setExpandGallery] = useState(false);
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // localStorage からトークン復元
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('gh_wiki_token');
      if (saved) setToken(saved);
    }
  }, []);

  // トークンがあれば既存画像を取得
  useEffect(() => {
    if (token && docId) {
      fetchImages();
    }
  }, [token, docId]);

  const saveToken = (t) => {
    setToken(t);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gh_wiki_token', t);
    }
    setShowTokenInput(false);
    setError('');
  };

  const clearToken = () => {
    setToken('');
    if (typeof window !== 'undefined') {
      localStorage.removeItem('gh_wiki_token');
    }
    setImages([]);
  };

  const apiHeaders = () => ({
    Authorization: `token ${token}`,
    Accept: 'application/vnd.github.v3+json',
  });

  /** GitHub API: 既存画像一覧 + featured 情報を取得 */
  const fetchImages = async () => {
    if (!token) return;
    setLoadingImages(true);
    try {
      const dirPath = `${IMG_BASE_PATH}/${docId}`;
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${dirPath}?ref=${BRANCH}`,
        { headers: apiHeaders() }
      );
      if (res.status === 404) {
        setImages([]);
        setFeaturedName(null);
        setFeaturedSha(null);
        return;
      }
      if (!res.ok) {
        if (res.status === 401) {
          setError('トークンが無効です。再設定してください。');
          clearToken();
          return;
        }
        throw new Error(`GitHub API error: ${res.status}`);
      }
      const data = await res.json();
      if (!Array.isArray(data)) return;

      // 画像ファイル
      const imgFiles = data
        .filter(f => /\.(png|jpe?g|gif|webp|svg)$/i.test(f.name))
        .map(f => ({
          name: f.name,
          url: f.download_url,
          sha: f.sha,
          path: f.path,
        }));
      setImages(imgFiles);

      // _featured.json を読み込み
      const featFile = data.find(f => f.name === FEATURED_FILE);
      if (featFile) {
        setFeaturedSha(featFile.sha);
        try {
          const featRes = await fetch(featFile.download_url);
          const featData = await featRes.json();
          setFeaturedName(featData.featured || null);
        } catch {
          setFeaturedName(null);
        }
      } else {
        setFeaturedName(null);
        setFeaturedSha(null);
      }
    } catch (err) {
      console.error('Failed to fetch images:', err);
      setError('画像一覧の取得に失敗しました。');
    } finally {
      setLoadingImages(false);
    }
  };

  /** ファイルを Base64 に変換 */
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  /** GitHub API: 画像をアップロード */
  const uploadImage = async (file) => {
    if (!token) {
      setShowTokenInput(true);
      setError('GitHub トークンを設定してください。');
      return;
    }
    if (!file || !file.type.startsWith('image/')) {
      setError('画像ファイルのみアップロード可能です。');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const ext = file.name?.split('.').pop() || 'png';
      const timestamp = Date.now();
      const fileName = `${docId}_${timestamp}.${ext}`;
      const filePath = `${IMG_BASE_PATH}/${docId}/${fileName}`;
      const base64 = await fileToBase64(file);

      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `[wiki] Add image: ${docId}/${fileName}`,
            content: base64,
            branch: BRANCH,
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setError('トークンが無効です。再設定してください。');
          clearToken();
          return;
        }
        throw new Error(errData.message || `Upload failed: ${res.status}`);
      }

      const data = await res.json();
      const newImg = {
        name: fileName,
        url: data.content.download_url,
        sha: data.content.sha,
        path: data.content.path,
      };
      setImages((prev) => [...prev, newImg]);

      // 画像がまだ無ければ自動的にメインに設定
      if (images.length === 0) {
        await setFeatured(fileName);
      }
    } catch (err) {
      console.error('Upload failed:', err);
      setError(`アップロード失敗: ${err.message}`);
    } finally {
      setUploading(false);
    }
  };

  /** GitHub API: メイン画像を設定 (_featured.json を更新) */
  const setFeatured = async (imageName) => {
    setError('');
    try {
      const filePath = `${IMG_BASE_PATH}/${docId}/${FEATURED_FILE}`;
      const content = btoa(JSON.stringify({ featured: imageName }, null, 2));

      const body = {
        message: `[wiki] Set featured image: ${docId}/${imageName}`,
        content,
        branch: BRANCH,
      };
      if (featuredSha) body.sha = featuredSha;

      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${filePath}`,
        {
          method: 'PUT',
          headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) throw new Error(`Failed to update featured: ${res.status}`);
      const data = await res.json();
      setFeaturedName(imageName);
      setFeaturedSha(data.content.sha);
    } catch (err) {
      setError(`メイン画像設定失敗: ${err.message}`);
    }
  };

  /** GitHub API: 画像を削除 */
  const deleteImage = async (img) => {
    if (!window.confirm(`「${img.name}」を削除しますか？`)) return;
    setError('');
    try {
      const res = await fetch(
        `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${img.path}`,
        {
          method: 'DELETE',
          headers: { ...apiHeaders(), 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `[wiki] Delete image: ${img.name}`,
            sha: img.sha,
            branch: BRANCH,
          }),
        }
      );
      if (!res.ok) throw new Error(`Delete failed: ${res.status}`);
      setImages((prev) => prev.filter((i) => i.sha !== img.sha));

      // 削除した画像がメインだった場合、メインをクリア
      if (featuredName === img.name) {
        setFeaturedName(null);
      }
    } catch (err) {
      setError(`削除失敗: ${err.message}`);
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

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragOver(false);
      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('image/')
      );
      if (files.length > 0) uploadImage(files[0]);
    },
    [token, docId, images]
  );

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
        const file = imgItem.getAsFile();
        if (file) uploadImage(file);
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [token, docId, images]);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) uploadImage(file);
    e.target.value = '';
  };

  // メイン画像オブジェクト
  const featuredImg = images.find((img) => img.name === featuredName);

  return (
    <div className={styles.container}>
      {/* ── メイン画像（上部に1枚大きく表示） ── */}
      {featuredImg && (
        <div className={styles.featured}>
          <img
            src={featuredImg.url}
            alt={featuredImg.name}
            className={styles.featuredImage}
          />
        </div>
      )}

      {/* ── トークン未設定時 ── */}
      {!token && !showTokenInput && (
        <button
          className={styles.tokenBtn}
          onClick={() => setShowTokenInput(true)}
        >
          🔑 トークン設定で画像を有効化
        </button>
      )}

      {showTokenInput && (
        <div className={styles.tokenInput}>
          <input
            type="password"
            placeholder="ghp_xxxx... (repo スコープ)"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                saveToken(e.target.value.trim());
              }
            }}
            autoFocus
          />
          <button onClick={() => setShowTokenInput(false)}>×</button>
        </div>
      )}

      {/* ── ギャラリー＆アップロード（下部） ── */}
      {token && (
        <>
          <div className={styles.galleryHeader}>
            <button
              className={styles.toggleBtn}
              onClick={() => setExpandGallery((v) => !v)}
            >
              {expandGallery ? '▲ 画像ギャラリーを閉じる' : '▼ 画像ギャラリー / アップロード'}
            </button>
            <button
              className={styles.tokenClearBtn}
              onClick={clearToken}
              title="トークンを削除"
            >
              🔑
            </button>
          </div>

          {expandGallery && (
            <div className={styles.galleryPanel}>
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
                  <span className={styles.spinner}>⏳ アップロード中...</span>
                ) : (
                  <>
                    <span className={styles.dropIcon}>📎</span>
                    <span className={styles.dropText}>
                      ドラッグ＆ドロップ / クリック / Ctrl+V
                    </span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className={styles.hiddenInput}
                />
              </div>

              {/* エラー */}
              {error && <div className={styles.error}>{error}</div>}

              {/* 読み込み中 */}
              {loadingImages && (
                <div className={styles.loading}>画像を読み込み中...</div>
              )}

              {/* 画像一覧（制限なし） */}
              {images.length === 0 && !loadingImages && (
                <div className={styles.empty}>画像はまだありません</div>
              )}

              <div className={styles.grid}>
                {images.map((img) => (
                  <div
                    key={img.sha}
                    className={`${styles.card} ${img.name === featuredName ? styles.cardFeatured : ''}`}
                  >
                    <img
                      src={img.url}
                      alt={img.name}
                      className={styles.thumb}
                      loading="lazy"
                    />
                    <div className={styles.cardActions}>
                      <button
                        className={styles.featBtn}
                        onClick={() => setFeatured(img.name)}
                        disabled={img.name === featuredName}
                        title="メイン画像に設定"
                      >
                        {img.name === featuredName ? '⭐' : '☆'}
                      </button>
                      <span className={styles.cardName} title={img.name}>
                        {img.name.length > 18
                          ? img.name.slice(0, 15) + '...'
                          : img.name}
                      </span>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => deleteImage(img)}
                        title="削除"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
