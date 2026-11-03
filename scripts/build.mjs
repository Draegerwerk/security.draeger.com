import { cp, lstat, mkdir, readFile, readdir, realpath, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import MarkdownIt from 'markdown-it';
import { parse as parseYaml } from 'yaml';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import tailwindConfig from '../tailwind.config.cjs';

export const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
})[char]);
const slug = (text) => text.toLowerCase().normalize('NFC')
  .replace(/[^\p{L}\p{N}\s_-]/gu, '').trim().replace(/\s+/g, '-') || 'section';

export function createMarkdown() {
  const markdown = new MarkdownIt({ html: true, linkify: true });
  markdown.core.ruler.push('page-links-and-headings', (state) => {
    const usedIds = new Set(state.env.reservedIds ?? []);
    for (let index = 0; index < state.tokens.length; index++) {
      const token = state.tokens[index];
      if (token.type === 'heading_open') {
        const inline = state.tokens[index + 1];
        const explicit = inline.content.match(/\s+\{#([A-Za-z][\w-]*)\}$/);
        if (explicit) {
          inline.content = inline.content.slice(0, explicit.index);
          inline.children = markdown.parseInline(inline.content, state.env)[0].children;
        }
        const text = inline.children.filter((child) => ['text', 'code_inline'].includes(child.type))
          .map((child) => child.content).join('');
        const base = explicit ? explicit[1] : slug(text);
        let id = base;
        let suffix = 2;
        if (explicit && usedIds.has(id)) throw new Error('Duplicate heading ID: ' + id);
        while (usedIds.has(id)) id = base + '-' + suffix++;
        usedIds.add(id);
        token.attrSet('id', id);
      }
      for (const child of token.children ?? []) {
        if (child.type !== 'link_open') continue;
        const href = child.attrGet('href');
        if (href && !/^(?:[a-z][a-z\d+.-]*:|\/|#)/i.test(href)) {
          child.attrSet('href', href.replace(/\.md(?=[?#]|$)/i, '.html'));
        }
      }
    }
  });
  return markdown;
}

export async function readPages(root) {
  const entries = await readdir(root, { withFileTypes: true });
  const files = entries.filter((file) => file.isFile() && /\.md$/i.test(file.name));
  const parentName = (name) => name.replace(/\.\d{3}(?=\.md$)/i, '');
  const parents = files.filter((file) => parentName(file.name) === file.name);
  for (const file of files) {
    if (!parents.some((parent) => parent.name.toLowerCase() === parentName(file.name).toLowerCase())) {
      throw new Error(file.name + ': missing parent file ' + parentName(file.name));
    }
  }
  const markdown = createMarkdown();
  const outputs = new Set();
  const pages = [];
  for (const entry of parents) {
    const source = (await readFile(path.join(root, entry.name), 'utf8')).replace(/^\uFEFF/, '');
    const frontMatter = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    const metadata = frontMatter ? parseYaml(frontMatter[1]) ?? {} : {};
    if (typeof metadata !== 'object' || Array.isArray(metadata)) {
      throw new Error(entry.name + ': metadata must be a YAML mapping.');
    }
    for (const field of ['title', 'nav_title', 'description']) {
      if (metadata[field] !== undefined && (typeof metadata[field] !== 'string' || !metadata[field].trim())) {
        throw new Error(entry.name + ': ' + field + ' must be nonempty text.');
      }
    }
    if (metadata.nav_order !== undefined && !Number.isFinite(metadata.nav_order)) {
      throw new Error(entry.name + ': nav_order must be a number.');
    }
    const filename = entry.name.replace(/\.md$/i, '.html');
    if (outputs.has(filename.toLowerCase())) throw new Error('Duplicate output filename: ' + filename);
    outputs.add(filename.toLowerCase());
    const fragments = await Promise.all(files
      .filter((file) => file !== entry && parentName(file.name).toLowerCase() === entry.name.toLowerCase())
      .sort((a, b) => b.name.localeCompare(a.name, 'en'))
      .map((file) => readFile(path.join(root, file.name), 'utf8')));
    const body = [source.slice(frontMatter?.[0].length ?? 0).trim(), ...fragments].join('\n\n');
    const tokens = markdown.parse(body, {});
    const headingIndex = tokens.findIndex((token) => token.type === 'heading_open' && token.tag === 'h1');
    const heading = headingIndex < 0 ? undefined : tokens[headingIndex + 1].children
      .filter((token) => ['text', 'code_inline'].includes(token.type)).map((token) => token.content).join('');
    const title = metadata.title ?? heading ?? entry.name.replace(/\.md$/i, '').replace(/[-_]/g, ' ');
    pages.push({
      source: entry.name, filename, title, navTitle: metadata.nav_title ?? title,
      order: metadata.nav_order ?? (filename.toLowerCase() === 'index.html' ? 0 : 100),
      description: metadata.description ?? '',
      content: (headingIndex < 0 ? '<h1 id="' + escapeHtml(slug(title)) + '">' + escapeHtml(title) + '</h1>\n' : '') +
        markdown.render(body, { reservedIds: headingIndex < 0 ? [slug(title)] : [] }),
    });
  }
  if (!pages.length) throw new Error('No Markdown files found in the project root.');
  return pages.sort((a, b) => a.order - b.order || a.filename.localeCompare(b.filename, 'en'));
}

export function renderPage(page, pages, template, config, logo, year) {
  const navigation = pages.map((item) => '<a class="nav-link" href="' + escapeHtml(encodeURIComponent(item.filename)) +
    '"' + (item.filename === page.filename ? ' aria-current="page"' : '') + '>' +
    escapeHtml(item.navTitle) + '</a>').join('\n            ');
  const legalLinks = config.legalLinks.map((item) => '<a href="' + escapeHtml(item.url) + '">' +
    escapeHtml(item.title) + '</a>').join('\n          ');
  const values = {
    language: escapeHtml(config.language), pageTitle: escapeHtml(page.title),
    siteTitle: escapeHtml(config.title), description: escapeHtml(page.description),
    navigation, content: page.content, logo, legalLinks,
    copyright: escapeHtml(config.copyright), year,
  };
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error('Unknown template field: ' + key);
    return values[key];
  });
}

export async function buildSite(root = projectRoot) {
  root = await realpath(root);
  const output = path.resolve(root, '_site');
  // Keep deletion inside the project.
  if (path.dirname(output) !== root) throw new Error('Output must be inside the project.');
  const previous = await lstat(output).catch((error) => {
    if (error.code !== 'ENOENT') throw error;
  });
  if (previous?.isSymbolicLink()) throw new Error('_site must not be a symbolic link.');
  const [pages, template, configText, logo, cssSource] = await Promise.all([
    readPages(root),
    readFile(path.join(root, 'templates/page.html'), 'utf8'),
    readFile(path.join(root, 'site.config.json'), 'utf8'),
    readFile(path.join(root, 'templates/logo.svg'), 'utf8'),
    readFile(path.join(root, 'styles/site.css'), 'utf8'),
  ]);
  const config = JSON.parse(configText);
  const year = new Date().getUTCFullYear();
  const rendered = pages.map((page) => ({
    ...page, html: renderPage(page, pages, template, config, logo, year),
  }));
  const css = await postcss([tailwindcss({
    ...tailwindConfig,
    content: rendered.map((page) => ({ raw: page.html, extension: 'html' })),
  })]).process(cssSource, { from: path.join(root, 'styles/site.css'), map: false });
  await rm(output, { recursive: true, force: true });
  await mkdir(path.join(output, 'assets/css'), { recursive: true });
  await cp(path.join(root, 'assets'), path.join(output, 'assets'), { recursive: true });
  await cp(path.join(root, 'advisories'), path.join(output, 'advisories'), { recursive: true });
  await writeFile(path.join(output, 'assets/css/site.css'), css.css);
  await writeFile(path.join(output, '.nojekyll'), '');
  for (const page of rendered) await writeFile(path.join(output, page.filename), page.html);
  console.log('Built ' + pages.length + ' Markdown pages and Tailwind CSS in ' + output);
  return rendered;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await buildSite();
}
