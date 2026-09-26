import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('social stats request only YouTube and omit cross-platform analytics', async () => {
  const script = await readFile(new URL('socials.js', root), 'utf8');
  assert.ok(script.includes("fetch('/api/socials?platform=youtube'"));
  assert.doesNotMatch(script, /platform=instagram|platform=twitter/);
  assert.doesNotMatch(script, /of 3 live feeds|function renderCharts/);
  const html = await readFile(new URL('track.html', root), 'utf8');
  const socialTemplate = html.split('<template id="socials-template">')[1];
  assert.match(socialTemplate, /YouTube stats/);
  assert.doesNotMatch(socialTemplate, /followers-chart|views-chart|resume-milestone|creator-work|new-uploads|most-popular/);
  assert.match(socialTemplate, /id="youtube-metrics"/);
  for (const section of ['latest', 'recent', 'top', 'popular']) assert.ok(socialTemplate.includes(`id="youtube-${section}"`));
  const css = await readFile(new URL('track-editorial.css', root), 'utf8');
  assert.match(css, /html\[data-track="socials"\].*--accent: #c4a0ff/);
  assert.match(css, /html\[data-theme="light"\]\[data-track="socials"\].*--accent: #7436b8/);
  for (const href of ['https://www.instagram.com/creyn1um/', 'https://x.com/wo0tz0', 'https://www.youtube.com/@crey2um']) {
    assert.ok(socialTemplate.includes(`href="${href}" target="_blank" rel="noopener noreferrer"`));
  }
});

test('portfolio navigation opens dedicated detailed track pages', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  for (const track of ['hardware', 'software', 'analyst', 'socials']) {
    assert.match(html, new RegExp(`href="/${track}"`));
    assert.doesNotMatch(html, new RegExp(`<section id="${track}"`));
  }
});

test('dedicated production routes render the detailed track template', async () => {
  const config = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));
  const destinations = new Map(config.rewrites.map(rule => [rule.source, rule.destination]));
  for (const track of ['hardware', 'software', 'analyst', 'socials']) {
    assert.equal(destinations.get(`/${track}`), '/track.html');
  }
});
