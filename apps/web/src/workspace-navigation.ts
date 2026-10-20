export type Page =
  | 'start'
  | 'overview'
  | 'topology'
  | 'evidence'
  | 'learn'
  | 'energy'
  | 'assurance'
  | 'emt'
  | 'studies';

const advancedPages: readonly Page[] = ['overview', 'topology', 'evidence', 'energy'];

export function pageForSearch(search: string, browserDemo: boolean): Page {
  const query = new URLSearchParams(search);
  if (browserDemo && query.has('study')) return 'studies';
  if (query.get('mode') === 'emt') return 'emt';
  if (query.has('lesson')) return 'learn';
  const view = query.get('view') as Page;
  const advanced = advancedPages.includes(view) ? view : 'overview';
  if (query.get('mode') === 'evidence') return 'assurance';
  if (!browserDemo) return advanced;
  return query.has('preset') || query.get('mode') === 'advanced' ? advanced : 'start';
}

export function urlForPage(href: string, next: Page): URL {
  const url = new URL(href);
  url.hash = '';
  url.searchParams.delete('view');
  if (next !== 'studies') url.searchParams.delete('study');
  else {
    url.searchParams.set('study', 'load-step');
    url.searchParams.delete('preset');
  }
  if (next !== 'learn') url.searchParams.delete('lesson');
  if (next === 'start' || next === 'learn' || next === 'studies') url.searchParams.delete('mode');
  else
    url.searchParams.set(
      'mode',
      next === 'assurance' ? 'evidence' : next === 'emt' ? 'emt' : 'advanced',
    );
  if (advancedPages.includes(next) && next !== 'overview') url.searchParams.set('view', next);
  if (next === 'start') url.searchParams.delete('preset');
  if (next === 'learn' && !url.searchParams.has('lesson'))
    url.searchParams.set('lesson', 'power-energy');
  return url;
}
