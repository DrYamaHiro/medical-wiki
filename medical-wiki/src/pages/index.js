import React from 'react';
import { Redirect } from '@docusaurus/router';

// ルート(/) は /docs/intro にリダイレクト
export default function Home() {
  return <Redirect to="/medical-wiki/docs/intro" />;
}
