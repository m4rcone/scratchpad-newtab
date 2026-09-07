import { test } from 'node:test';
import assert from 'node:assert/strict';
import { groupByDay, slugOf, snippetOf, titleOf, wordCount } from './model.ts';
import type { Draft } from '../storage/types.ts';

const draft = (over: Partial<Draft>): Draft => ({
  id: 'x',
  text: '',
  createdAt: 0,
  updatedAt: 0,
  schemaVersion: 1,
  ...over,
});

test('the title is the first non-empty line, without the marker', () => {
  assert.equal(titleOf('# a title\n\nbody'), 'a title');
  assert.equal(titleOf('\n\n  plain\n'), 'plain');
  assert.equal(titleOf('   \n'), '');
  assert.equal(titleOf('#'.repeat(3) + ' deep'), 'deep');
});

test('the slug survives accents and punctuation', () => {
  assert.equal(
    slugOf('# Refatorar o parser de eventos'),
    'refatorar-o-parser-de-eventos',
  );
  assert.equal(slugOf('### ção/ão!!'), 'cao-ao');
  assert.equal(slugOf(''), 'draft');
});

test('the snippet centres on the match', () => {
  const text = 'a'.repeat(60) + ' needle ' + 'b'.repeat(60);
  const snippet = snippetOf(text, 'needle');
  assert.ok(snippet.includes('needle'));
  assert.ok(snippet.startsWith('…'));
});

test('word count ignores surrounding space', () => {
  assert.equal(wordCount('  one   two \n three '), 3);
  assert.equal(wordCount('   '), 0);
});

test('grouping drops empty buckets', () => {
  const now = new Date('2026-09-06T12:00:00').getTime();
  const groups = groupByDay(
    [
      draft({ id: 'a', updatedAt: now - 3600_000 }),
      draft({ id: 'b', updatedAt: now - 40 * 3600_000 }),
    ],
    now,
  );
  assert.deepEqual(
    groups.map((g) => g.label),
    ['today', 'earlier'],
  );
});
