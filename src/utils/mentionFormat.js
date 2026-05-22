/**
 * Split comment text into plain segments and @ / @@ mention tokens for display.
 */
export function formatMentionSegments(text, users = [], nodes = []) {
  if (!text) return [{ type: 'text', value: '' }];

  const tokens = [
    ...nodes.map((n) => ({
      prefix: '@@',
      label: n.label,
      nodeType: n.type,
    })),
    ...users.map((u) => ({ prefix: '@', label: u.label })),
  ].filter((t) => t.label);

  const parts = [];
  let i = 0;

  while (i < text.length) {
    let best = null;

    for (const t of tokens) {
      const needle = `${t.prefix}${t.label}`;
      if (text.slice(i, i + needle.length) === needle) {
        if (!best || needle.length > best.value.length) {
          best = {
            type: 'mention',
            kind: t.prefix === '@@' ? 'node' : 'user',
            value: needle,
            length: needle.length,
            nodeType: t.nodeType,
            nodeName: t.label,
          };
        }
      }
    }

    if (best) {
      const segment = {
        type: best.type,
        kind: best.kind,
        value: best.value,
        nodeType: best.nodeType,
        nodeName: best.nodeName,
      };

      if (segment.kind === 'node') {
        const nodeMeta = nodes.find(
          (n) =>
            n.label === segment.nodeName ||
            segment.value === `@@${n.label}`
        );
        if (nodeMeta) {
          segment.nodeType = nodeMeta.type;
          segment.nodeName = nodeMeta.label;
        }
      }

      parts.push(segment);
      i += best.length;
      continue;
    }

    let j = i + 1;
    while (j < text.length && text[j] !== '@') {
      j += 1;
    }
    parts.push({ type: 'text', value: text.slice(i, j) });
    i = j;
  }

  return parts.length ? parts : [{ type: 'text', value: text }];
}
