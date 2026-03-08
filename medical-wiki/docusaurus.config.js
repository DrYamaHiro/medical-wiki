// @ts-check
import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Medical Knowledge Wiki',
  tagline: '医療知識ナレッジベース — 診療テンプレート＆教科書的解説',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://dryamahiro.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/medical-wiki/',

  // GitHub pages deployment config.
  organizationName: 'dryamahiro', // Usually your GitHub org/user name.
  projectName: 'medical-wiki', // Usually your repo name.

  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang.
  i18n: {
    defaultLocale: 'ja',
    locales: ['ja'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/DrYamaHiro/medical-wiki/tree/master/medical-wiki/',
          showLastUpdateTime: false,
          showLastUpdateAuthor: false,
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'Medical Wiki',
        logo: {
          alt: 'Medical Wiki Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'medicalSidebar',
            position: 'left',
            label: '📋 診療テンプレート',
          },
          {
            href: 'https://github.com/dryamahiro/medical-wiki',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'ドキュメント',
            items: [
              {
                label: '診療テンプレート',
                to: '/docs/intro',
              },
            ],
          },
          {
            title: '外部リンク',
            items: [
              {
                label: '日本内科学会',
                href: 'https://www.naika.or.jp/',
              },
              {
                label: '日本医師会',
                href: 'https://www.med.or.jp/',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Medical Knowledge Wiki. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
