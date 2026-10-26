#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const USAGE = '用法: node plugins/kocard-prd/scripts/check-prd.mjs <文件.html> [更多文件...] [--strict]';

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

function extractBlock(html, tag) {
  const match = html.match(new RegExp(`<${tag}>[\\s\\S]*?<\\/${tag}>`));
  return match ? match[0] : '';
}

function sectionHtml(html, id) {
  const match = html.match(new RegExp(`<section\\s+id="${id}"[\\s\\S]*?<\\/section>`));
  return match ? match[0] : '';
}

function tableHeaders(html, id) {
  const thead = sectionHtml(html, id).match(/<thead>[\s\S]*?<\/thead>/);
  if (!thead) return null;
  return Array.from(thead[0].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/g), (match) => match[1].trim());
}

function tableRowWidths(html, id) {
  const tbody = sectionHtml(html, id).match(/<tbody>[\s\S]*?<\/tbody>/);
  if (!tbody) return [];
  return Array.from(tbody[0].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g), (match) => (match[1].match(/<td\b/g) || []).length);
}

const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(USAGE);
  process.exit(0);
}

const unknownFlags = args.filter((arg) => arg.startsWith('--') && arg !== '--strict');
if (unknownFlags.length) fail(`不认识的参数：${unknownFlags.join(', ')}\n${USAGE}`);

const strict = args.includes('--strict');
const files = args.filter((arg) => !arg.startsWith('--'));
if (!files.length) fail(USAGE);

const root = repoRoot();
const templatePath = path.join(root, 'templates/prd/prd-template.html');
if (!existsSync(templatePath)) fail(`找不到模板：${templatePath}`);

const template = readFileSync(templatePath, 'utf8');
const templateStyle = extractBlock(template, 'style');
const templateScript = extractBlock(template, 'script');
const templateMarker = template.match(/<!--\s*prd-template:v\d+\s*-->/);
if (!templateMarker) fail('模板缺少版本标记（<!-- prd-template:v1 -->）。');
if (!templateStyle) fail('模板缺少 <style> 块。');

let totalErrors = 0;
let totalWarnings = 0;

for (const input of files) {
  const filePath = path.resolve(process.cwd(), input);
  const relative = path.relative(root, filePath) || input;

  if (!existsSync(filePath)) {
    console.log(`\n检查：${relative}`);
    console.log('错误：');
    console.log('  - 文件不存在。');
    totalErrors += 1;
    continue;
  }

  const doc = readFileSync(filePath, 'utf8');
  const errors = [];
  const warnings = [];

  if (!/^\d{4}-\d{2}-\d{2}-.+\.html$/.test(path.basename(filePath))) {
    errors.push('文件名必须是 YYYY-MM-DD-标题.html。');
  }

  const h1 = doc.match(/<h1>([\s\S]*?)<\/h1>/);
  if (!h1) {
    errors.push('缺少 <h1> 标题。');
  } else if (h1[1].includes('桌面端订阅支付')) {
    warnings.push('标题仍是模板示例「桌面端订阅支付」，请换成真实标题。');
  }

  const docMarker = doc.match(/<!--\s*prd-template:v\d+\s*-->/);
  if (!docMarker) {
    errors.push('缺少模板标记，可能不是从模板复制的；请用 new-prd.mjs 重新生成。');
  } else if (docMarker[0] !== templateMarker[0]) {
    warnings.push(`模板标记 ${docMarker[0]} 与当前模板 ${templateMarker[0]} 不一致。`);
  }

  if (extractBlock(doc, 'style') !== templateStyle) {
    errors.push('样式块与模板不一致；请重新从模板复制，不要改样式。');
  }
  if (extractBlock(doc, 'script') !== templateScript) {
    errors.push('脚本块与模板不一致；请重新从模板复制，不要改脚本。');
  }

  const sameTemplateVersion = Boolean(docMarker && docMarker[0] === templateMarker[0]);
  for (const id of ['requirements', 'states', 'acceptance', 'changelog', 'questions']) {
    const actualHeaders = tableHeaders(doc, id);
    if (!actualHeaders) continue;
    if (sameTemplateVersion) {
      const expectedHeaders = tableHeaders(template, id);
      if (expectedHeaders && expectedHeaders.join('|') !== actualHeaders.join('|')) {
        errors.push(`#${id} 表头与模板不一致；应为：${expectedHeaders.join(' / ')}。`);
        continue;
      }
    }
    const wrongRows = tableRowWidths(doc, id).filter((width) => width !== actualHeaders.length);
    if (wrongRows.length) {
      errors.push(`#${id} 有 ${wrongRows.length} 行单元格数与表头（${actualHeaders.length}）不一致。`);
    }
  }

  for (const match of doc.matchAll(/href="#([^"]+)"/g)) {
    if (!doc.includes(`id="${match[1]}"`)) {
      errors.push(`目录锚点 #${match[1]} 找不到对应章节。`);
    }
  }

  const footer = doc.match(/<footer[\s\S]*?<\/footer>/);
  const footerVersion = footer && footer[0].match(/\bv\d+(?:\.\d+)?\b/);
  const changelog = sectionHtml(doc, 'changelog');
  const latestVersion = changelog && changelog.match(/<td class="nowrap">(v\d+(?:\.\d+)?)<\/td>/);
  if (footerVersion && latestVersion && footerVersion[0] !== latestVersion[1]) {
    errors.push(`页脚版本 ${footerVersion[0]} 与变更记录最新版本 ${latestVersion[1]} 不一致。`);
  }

  for (const id of ['problem', 'goals', 'requirements', 'acceptance']) {
    if (!doc.includes(`id="${id}"`)) errors.push(`缺少核心章节 #${id}。`);
  }
  for (const id of ['data', 'ai-eval']) {
    if (doc.includes(`id="${id}"`)) errors.push(`不要包含 #${id} 章节（数据与接口 / AI 评测已从模板移除）。`);
  }

  if (/<h2[^>]*>\s*数据与接口\s*<\/h2>/.test(doc)) {
    errors.push('不要包含「数据与接口」章节；接口字段放工程文档。');
  }
  if (/<h2[^>]*>\s*AI[^<]*评测\s*<\/h2>/.test(doc)) {
    errors.push('不要默认包含「AI 评测」章节；AI 功能需要时单独补表。');
  }

  if (doc.includes('brand-mark') || doc.includes('class="brand"')) {
    errors.push('不要加品牌标或 logo 区块。');
  }
  if (/<link\b[^>]*\bhref=/i.test(doc)) {
    errors.push('不要引用外部样式表或资源。');
  }
  if (/<script\b[^>]*\bsrc=/i.test(doc)) {
    errors.push('不要引用外部脚本。');
  }
  if (/@import\b/i.test(doc)) {
    errors.push('不要使用 @import。');
  }
  if (/url\(\s*['"]?https?:/i.test(doc)) {
    errors.push('不要引用远程资源。');
  }

  if (/\[填[^\]]*\]/.test(doc)) {
    warnings.push('还有未填的占位内容（如 [填数字]）。');
  }
  if (/示例文档|示例模板|产品 · 待填/.test(doc)) {
    warnings.push('还残留示例文案，交付前删掉。');
  }
  if (doc.includes('模板使用说明') || doc.includes('PRD Template')) {
    errors.push('还残留模板说明或模板页脚；请用 new-prd.mjs 重新生成。');
  }

  totalErrors += errors.length;
  totalWarnings += warnings.length;

  console.log(`\n检查：${relative}`);
  if (errors.length) {
    console.log('错误：');
    for (const message of errors) console.log(`  - ${message}`);
  }
  if (warnings.length) {
    console.log('警告：');
    for (const message of warnings) console.log(`  - ${message}`);
  }
  if (!errors.length && !warnings.length) console.log('通过。');
}

console.log(`\n共检查 ${files.length} 个文件：${totalErrors} 个错误，${totalWarnings} 个警告。`);
if (totalErrors || (strict && totalWarnings)) {
  if (strict && totalWarnings && !totalErrors) {
    console.error('严格模式：警告按错误处理。');
  }
  process.exit(1);
}
