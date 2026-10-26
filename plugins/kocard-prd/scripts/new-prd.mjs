#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const USAGE = '用法: node plugins/kocard-prd/scripts/new-prd.mjs "文档标题" [--date YYYY-MM-DD]';

function fail(message) {
  console.error(`错误：${message}`);
  process.exit(1);
}

function repoRoot() {
  try {
    return execFileSync('git', ['rev-parse', '--show-toplevel'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return process.cwd();
  }
}

function localDate() {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
}

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function slugify(value) {
  return value
    .replace(/[\\/:*?"<>|]/g, '-')
    .replace(/[\u0000-\u001f]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[.-]+|[.-]+$/g, '')
    .slice(0, 80);
}

const args = process.argv.slice(2);
let date = localDate();
const titleParts = [];

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];
  if (arg === '--help' || arg === '-h') {
    console.log(USAGE);
    process.exit(0);
  } else if (arg === '--date') {
    date = args[index + 1] || '';
    index += 1;
  } else if (arg.startsWith('--date=')) {
    date = arg.slice('--date='.length);
  } else {
    titleParts.push(arg);
  }
}

const title = titleParts.join(' ').trim();
if (!title) fail(`缺少文档标题。\n${USAGE}`);
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) fail('日期格式必须是 YYYY-MM-DD。');

const root = repoRoot();
const templatePath = path.join(root, 'templates/prd/prd-template.html');
if (!existsSync(templatePath)) {
  fail(`找不到模板：${templatePath}`);
}

const relativeTemplate = path.relative(root, templatePath);
let html = readFileSync(templatePath, 'utf8');
if (!/<!--\s*prd-template:v\d+\s*-->/.test(html)) {
  fail(`模板缺少版本标记（<!-- prd-template:v1 -->）：${relativeTemplate}`);
}

const slug = slugify(title);
if (!slug) fail('标题无法生成合法文件名。');

const fileName = `${date}-${slug}.html`;
const outputPath = path.join(root, fileName);
const safeTitle = escapeHtml(title);

html = html.replace(/<title>[\s\S]*?<\/title>/, () => `<title>${safeTitle} · PRD</title>`);
html = html.replace(/<h1>[\s\S]*?<\/h1>/, () => `<h1>${safeTitle}</h1>`);
html = html.replace(/<div class="eyebrow">[\s\S]*?<\/div>/, () => '<div class="eyebrow">PRD</div>');
html = html.replaceAll('2026-10-26', date);
html = html.replace(
  /<p class="doc-note">[\s\S]*?<\/p>/,
  () => '<p class="doc-note">草稿，待评审。</p>',
);
html = html.replace(
  /<span>示例文档 · 替换内容后删除本行<\/span>/,
  () => '<span>草稿</span>',
);
html = html.replace(
  /<span><strong>PRD Template v0\.1<\/strong><\/span>/,
  () => `<span><strong>${safeTitle}</strong></span>`,
);
html = html.replace(
  /\s*<details class="fold">\s*<summary>模板使用说明<\/summary>[\s\S]*?<\/details>/,
  '',
);
html = html.replace(
  /(<section id="changelog">[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>)/,
  (match, open, close) => `${open}
              <tr>
                <td class="nowrap">${date}</td>
                <td class="nowrap">v0.1</td>
                <td>初稿。</td>
                <td>产品</td>
              </tr>
            ${close}`,
);

try {
  writeFileSync(outputPath, html, { encoding: 'utf8', flag: 'wx' });
} catch (error) {
  if (error.code === 'EEXIST') {
    fail(`文件已存在，未覆盖：${path.relative(root, outputPath)}`);
  }
  fail(error.message);
}

const relativeOutput = path.relative(root, outputPath);
console.log(`已创建：${relativeOutput}`);
console.log('下一步：');
console.log('  1. 替换示例内容；没有的章节整节删除。');
console.log(`  2. node plugins/kocard-prd/scripts/check-prd.mjs "${relativeOutput}" --strict`);
