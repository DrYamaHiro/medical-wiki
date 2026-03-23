import React, { useEffect, useRef, useState } from 'react';

/**
 * MermaidChart — JSX内でも安全に使えるMermaidラッパー
 * useColorMode等のhookを使わず、mermaidライブラリを直接呼び出す
 */
export default function MermaidChart({ chart }) {
  const ref = useRef(null);
  const [svg, setSvg] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || !chart) return;

    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'default',
          flowchart: { useMaxWidth: true, htmlLabels: true },
          securityLevel: 'loose',
        });
        const id = 'mermaid-' + Math.random().toString(36).slice(2, 9);
        const { svg: rendered } = await mermaid.render(id, chart);
        if (!cancelled) setSvg(rendered);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Mermaid render error');
      }
    })();

    return () => { cancelled = true; };
  }, [chart]);

  if (error) {
    return <pre style={{ color: '#dc2626', fontSize: '0.8rem' }}>{error}</pre>;
  }
  if (!svg) {
    return <div style={{ padding: '1rem', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>図を読み込み中...</div>;
  }
  return <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} style={{ textAlign: 'center' }} />;
}
