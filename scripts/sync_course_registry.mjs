// Keep the lightweight navigation shell independent of lazy lesson prose/scenes.
import { lessons } from '../apps/web/src/course-lessons.ts';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { format } from '../apps/web/node_modules/prettier/index.mjs';
const root = new URL('../apps/web/src/', import.meta.url);
const content = new URL('infrastructure/content/', root);
const infrastructure = readdirSync(content).filter((name) => name.endsWith('.json')).sort().map((name) => JSON.parse(readFileSync(new URL(name, content), 'utf8')));
const registry = [
  ...lessons.map((lesson, index) => ({ id: lesson.id, number: index + 1, title: lesson.title.replace(/^\d+\.\s*/, ''), trackId: index < 5 ? 'foundations' : 'facility', renderer: 'legacy', readingRoute: `learn/${lesson.id}/`, prerequisites: [] })),
  ...infrastructure.map((lesson) => ({ id: lesson.id, number: lesson.number, title: lesson.title, trackId: lesson.trackId, renderer: 'infrastructure', readingRoute: lesson.readingRoute, prerequisites: lesson.prerequisites })),
];
if (new Set(registry.map((item) => item.id)).size !== registry.length) throw new Error('Duplicate lesson ID');
if (registry.some((item, index) => item.number !== index + 1)) throw new Error('Lesson sequence gap');
const output = await format(JSON.stringify(registry), { parser: 'json' });
const target = new URL('course-catalog.json', root);
if (process.argv.includes('--check')) {
  if (readFileSync(target, 'utf8').replaceAll('\r\n', '\n') !== output) throw new Error('Course catalog is stale; run node scripts/sync_course_registry.mjs');
} else writeFileSync(fileURLToPath(target), output);
