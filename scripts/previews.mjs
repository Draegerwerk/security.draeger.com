import { createHash } from 'node:crypto';
import { appendFile, mkdir, realpath, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { unzipSync } from 'fflate';

const maxArchiveSize = 100 * 1024 * 1024;
const maxExpandedSize = 250 * 1024 * 1024;

export function previewDirectory(branch) {
  const label = branch.toLowerCase().replace(/[^a-z0-9-]+/g, '-').replace(/^-|-$/g, '').slice(0, 48) || 'branch';
  const hash = createHash('sha256').update(branch).digest('hex').slice(0, 12);
  return 'previews/' + label + '-' + hash;
}

export function selectPreviewRuns(runs, branches, repository) {
  const heads = new Map(branches.map((branch) => [branch.name, branch.commit.sha]));
  const selected = new Map();
  for (const run of runs) {
    if (run.head_branch === 'main' || selected.has(run.head_branch)) continue;
    if (run.event !== 'push' || run.status !== 'completed' || run.conclusion !== 'success') continue;
    if (run.head_repository?.full_name !== repository || heads.get(run.head_branch) !== run.head_sha) continue;
    selected.set(run.head_branch, run);
  }
  return [...selected.values()].sort((a, b) => a.head_branch.localeCompare(b.head_branch, 'en'));
}

export async function addPreview(output, branch, archive) {
  if (branch === 'main') throw new Error('Main is the production site, not a branch preview.');
  if (archive.byteLength > maxArchiveSize) throw new Error('Preview archive exceeds 100 MiB.');
  let expandedSize = 0;
  const files = unzipSync(archive, {
    filter: (file) => {
      expandedSize += file.originalSize;
      if (expandedSize > maxExpandedSize) throw new Error('Expanded preview exceeds 250 MiB.');
      return true;
    },
  });
  if (!files['index.html']) throw new Error('A branch preview must contain index.html.');
  // Check all paths before writing files.
  for (const name of Object.keys(files)) {
    const parts = name.replace(/\/$/, '').split('/');
    if (name.startsWith('/') || /[\\:\0]/.test(name) || parts.some((part) => !part || part === '.' || part === '..')) {
      throw new Error('Unsafe path in preview archive: ' + name);
    }
  }
  output = await realpath(output);
  const directory = previewDirectory(branch);
  const destination = path.resolve(output, directory);
  if (!destination.startsWith(output + path.sep)) throw new Error('Preview must stay inside the generated site.');
  for (const [name, bytes] of Object.entries(files)) {
    if (name.endsWith('/')) continue;
    const filename = path.resolve(destination, name);
    if (!filename.startsWith(destination + path.sep)) throw new Error('Preview file escapes its directory.');
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, bytes);
  }
  return directory;
}

export async function assemblePreviews({
  output, repository, baseUrl, getBranches, getRuns, getArtifact, download,
}) {
  const [branches, runs] = await Promise.all([getBranches(), getRuns()]);
  const previews = [];
  for (const run of selectPreviewRuns(runs, branches, repository)) {
    const artifact = await getArtifact(run.id);
    if (!artifact || artifact.expired) continue;
    const directory = await addPreview(output, run.head_branch, await download(artifact.id));
    previews.push({
      branch: run.head_branch,
      commit: run.head_sha,
      url: baseUrl.replace(/\/$/, '') + '/' + directory + '/',
    });
  }
  await mkdir(path.join(output, 'previews'), { recursive: true });
  await writeFile(path.join(output, 'previews/index.json'), JSON.stringify(previews, null, 2) + '\n');
  return previews;
}

async function publishPreviews() {
  const repository = process.env.GITHUB_REPOSITORY;
  const token = process.env.GITHUB_TOKEN;
  const baseUrl = process.env.PAGES_URL;
  if (!repository || !token || !baseUrl) throw new Error('GITHUB_REPOSITORY, GITHUB_TOKEN, and PAGES_URL are required.');
  const api = 'https://api.github.com/repos/' + repository;
  const headers = {
    Authorization: 'Bearer ' + token,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  async function getJson(route) {
    const response = await fetch(api + route, { headers, signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error('GitHub API returned ' + response.status + ' for ' + route);
    return response.json();
  }
  async function list(route, field) {
    const records = [];
    for (let page = 1; ; page++) {
      const data = await getJson(route + (route.includes('?') ? '&' : '?') + 'per_page=100&page=' + page);
      const batch = field ? data[field] : data;
      records.push(...batch);
      if (batch.length < 100) return records;
    }
  }
  async function download(id) {
    let response = await fetch(api + '/actions/artifacts/' + id + '/zip', {
      headers, redirect: 'manual', signal: AbortSignal.timeout(30000),
    });
    if (response.status === 302) {
      const signedUrl = new URL(response.headers.get('location'));
      if (signedUrl.protocol !== 'https:') throw new Error('The artifact download must use HTTPS.');
      // Do not send the token to the download host.
      response = await fetch(signedUrl, { signal: AbortSignal.timeout(30000) });
    }
    if (!response.ok) throw new Error('Artifact download failed: ' + response.status);
    if (Number(response.headers.get('content-length')) > maxArchiveSize) throw new Error('Preview archive exceeds 100 MiB.');
    return new Uint8Array(await response.arrayBuffer());
  }
  const previews = await assemblePreviews({
    output: fileURLToPath(new URL('../_site', import.meta.url)),
    repository, baseUrl,
    getBranches: () => list('/branches'),
    getRuns: () => list('/actions/workflows/build.yml/runs?event=push&status=success', 'workflow_runs'),
    getArtifact: async (id) => (await list('/actions/runs/' + id + '/artifacts', 'artifacts'))
      .find((artifact) => artifact.name === 'site' && !artifact.expired),
    download,
  });
  const summary = ['## Published branch previews', '', ...previews.map((preview) =>
    '- [' + preview.branch.replace(/[[\]\\]/g, '\\$&') + '](' + preview.url + ') — ' + preview.commit.slice(0, 7)),
  ].join('\n') + '\n';
  if (process.env.GITHUB_STEP_SUMMARY) await appendFile(process.env.GITHUB_STEP_SUMMARY, summary);
  console.log('Added ' + previews.length + ' live branch previews.');
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await publishPreviews();
}
