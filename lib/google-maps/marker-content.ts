export function markerContent(label: string) {
  const element = document.createElement('div');
  element.className = 'flex items-center gap-1.5';

  const dot = document.createElement('span');
  dot.className = 'size-3 shrink-0 rounded-full bg-white ring-2 ring-black/60';

  const text = document.createElement('span');
  text.className =
    'rounded bg-black/70 px-1.5 py-0.5 text-xs whitespace-nowrap text-white';
  text.textContent = label;

  element.append(dot, text);
  return element;
}
