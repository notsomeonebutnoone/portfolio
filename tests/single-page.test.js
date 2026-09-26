import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('social stats request only YouTube and omit cross-platform analytics', async () => {
  const script = await readFile(new URL('socials.js', root), 'utf8');
  const platforms = script.match(/const platforms = \[([\s\S]*?)\];/)[1];
  assert.deepEqual([...platforms.matchAll(/platform: '([^']+)'/g)].map(match => match[1]), ['youtube']);
  assert.doesNotMatch(script, /of 3 live feeds|function renderCharts/);
  const html = await readFile(new URL('track.html', root), 'utf8');
  const socialTemplate = html.split('<template id="socials-template">')[1];
  assert.match(socialTemplate, /YouTube stats/);
  assert.doesNotMatch(socialTemplate, /followers-chart|views-chart|resume-milestone/);
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
