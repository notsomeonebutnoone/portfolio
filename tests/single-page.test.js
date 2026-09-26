import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root = new URL('../', import.meta.url);

test('portfolio navigation keeps every track on the landing page', async () => {
  const html = await readFile(new URL('index.html', root), 'utf8');
  for (const track of ['hardware', 'software', 'analyst', 'socials']) {
    assert.match(html, new RegExp(`href="#${track}"`));
    assert.match(html, new RegExp(`<section id="${track}"`));
    assert.doesNotMatch(html, new RegExp(`href="/${track}"`));
  }
});

test('legacy production routes render the unified landing page', async () => {
  const config = JSON.parse(await readFile(new URL('vercel.json', root), 'utf8'));
  const destinations = new Map(config.rewrites.map(rule => [rule.source, rule.destination]));
  for (const track of ['hardware', 'software', 'analyst', 'socials']) {
    assert.equal(destinations.get(`/${track}`), '/index.html');
  }
});
