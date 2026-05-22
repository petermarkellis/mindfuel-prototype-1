import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Chip from './Chip';
import './MentionTextarea.css';

const PICKER_MAX_HEIGHT = 176;
const PICKER_GAP = 6;

const PICKER_NAV_KEYS = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Enter',
  'Tab',
  'Escape',
  'Home',
  'End',
  'PageUp',
  'PageDown',
]);

/**
 * Detect @ (user) or @@ (node) mention trigger at cursor.
 * @@ is checked first so a single @ inside @@ does not open the user list.
 */
export function detectMentionTrigger(text, cursor) {
  const before = text.slice(0, cursor);

  const nodeMatch = before.match(/@@([^\s@]*)$/);
  if (nodeMatch) {
    const token = nodeMatch[0];
    return {
      type: 'node',
      query: nodeMatch[1],
      triggerStart: cursor - token.length,
      triggerEnd: cursor,
    };
  }

  const userMatch = before.match(/@([^\s@]*)$/);
  if (userMatch) {
    const atIndex = before.length - userMatch[0].length;
    if (atIndex > 0 && before[atIndex - 1] === '@') {
      return null;
    }
    return {
      type: 'user',
      query: userMatch[1],
      triggerStart: atIndex,
      triggerEnd: cursor,
    };
  }

  return null;
}

function filterMentionItems(items, query) {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter((item) => {
    const label = (item.label || '').toLowerCase();
    const sub = (item.sublabel || '').toLowerCase();
    return label.includes(q) || sub.includes(q);
  });
}

function computePickerStyle(textarea) {
  if (!textarea) return null;

  const rect = textarea.getBoundingClientRect();
  const spaceAbove = rect.top;
  const spaceBelow = window.innerHeight - rect.bottom;
  const openAbove =
    spaceAbove >= PICKER_MAX_HEIGHT + PICKER_GAP || spaceBelow < PICKER_MAX_HEIGHT;

  return {
    position: 'fixed',
    left: `${rect.left}px`,
    width: `${rect.width}px`,
    zIndex: 100000,
    maxHeight: `${PICKER_MAX_HEIGHT}px`,
    ...(openAbove
      ? { bottom: `${window.innerHeight - rect.top + PICKER_GAP}px` }
      : { top: `${rect.bottom + PICKER_GAP}px` }),
  };
}

export default function MentionTextarea({
  value,
  onChange,
  users = [],
  nodes = [],
  placeholder,
  rows = 3,
  id,
  className = '',
  ariaLabel,
  disabled = false,
}) {
  const textareaRef = useRef(null);
  const listRef = useRef(null);
  const mentionSessionRef = useRef({
    open: false,
    type: null,
    triggerStart: -1,
    query: '',
  });
  const [pickerOpen, setPickerOpen] = useState(false);
  const [mentionType, setMentionType] = useState(null);
  const [mentionQuery, setMentionQuery] = useState('');
  const [triggerRange, setTriggerRange] = useState({ start: 0, end: 0 });
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [pickerStyle, setPickerStyle] = useState(null);

  const sourceItems = mentionType === 'node' ? nodes : users;

  const filteredItems = useMemo(
    () => filterMentionItems(sourceItems, mentionQuery),
    [sourceItems, mentionQuery]
  );

  const closePicker = useCallback(() => {
    mentionSessionRef.current = {
      open: false,
      type: null,
      triggerStart: -1,
      query: '',
    };
    setPickerOpen(false);
    setMentionType(null);
    setMentionQuery('');
    setHighlightIndex(0);
    setPickerStyle(null);
  }, []);

  const repositionPicker = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !pickerOpen) return;
    setPickerStyle(computePickerStyle(textarea));
  }, [pickerOpen]);

  const syncMentionFromCursor = useCallback(
    (text, cursor) => {
      const trigger = detectMentionTrigger(text, cursor);
      if (!trigger) {
        mentionSessionRef.current = {
          open: false,
          type: null,
          triggerStart: -1,
          query: '',
        };
        closePicker();
        return;
      }

      const prev = mentionSessionRef.current;
      const isNewSession =
        !prev.open ||
        prev.type !== trigger.type ||
        prev.triggerStart !== trigger.triggerStart;
      const queryChanged = prev.query !== trigger.query;

      mentionSessionRef.current = {
        open: true,
        type: trigger.type,
        triggerStart: trigger.triggerStart,
        query: trigger.query,
      };

      const textarea = textareaRef.current;
      setPickerOpen(true);
      setMentionType(trigger.type);
      setMentionQuery(trigger.query);
      setTriggerRange({ start: trigger.triggerStart, end: trigger.triggerEnd });

      if (isNewSession || queryChanged) {
        setHighlightIndex(0);
      }

      if (textarea) {
        setPickerStyle(computePickerStyle(textarea));
      }
    },
    [closePicker]
  );

  useLayoutEffect(() => {
    repositionPicker();
  }, [pickerOpen, mentionType, mentionQuery, filteredItems.length, repositionPicker]);

  useEffect(() => {
    if (!pickerOpen) return undefined;

    const onReposition = () => repositionPicker();
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);

    return () => {
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [pickerOpen, repositionPicker]);

  const handleChange = (e) => {
    const next = e.target.value;
    onChange(next);
    syncMentionFromCursor(next, e.target.selectionStart);
  };

  const handleCursorSync = (e) => {
    if (PICKER_NAV_KEYS.has(e.key)) return;
    syncMentionFromCursor(e.target.value, e.target.selectionStart);
  };

  const insertMention = useCallback(
    (item) => {
      const textarea = textareaRef.current;
      if (!textarea || !item?.label) return;

      const prefix = mentionType === 'node' ? '@@' : '@';
      const insertion = `${prefix}${item.label} `;
      const { start, end } = triggerRange;
      const next = value.slice(0, start) + insertion + value.slice(end);
      const cursor = start + insertion.length;

      onChange(next);
      closePicker();

      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(cursor, cursor);
      });
    },
    [mentionType, triggerRange, value, onChange, closePicker]
  );

  const handleKeyDown = (e) => {
    if (!pickerOpen) return;

    if (filteredItems.length === 0) {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePicker();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((i) => (i + 1) % filteredItems.length);
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((i) => (i - 1 + filteredItems.length) % filteredItems.length);
      return;
    }

    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      insertMention(filteredItems[highlightIndex]);
      return;
    }

    if (e.key === 'Escape') {
      e.preventDefault();
      closePicker();
    }
  };

  useEffect(() => {
    if (filteredItems.length === 0) return;
    if (highlightIndex >= filteredItems.length) {
      setHighlightIndex(filteredItems.length - 1);
    }
  }, [filteredItems.length, highlightIndex]);

  useEffect(() => {
    if (!pickerOpen || !listRef.current) return;
    const active = listRef.current.querySelector('.mention-picker-item--active');
    active?.scrollIntoView({ block: 'nearest' });
  }, [highlightIndex, pickerOpen, filteredItems]);

  const pickerLabel = mentionType === 'node' ? 'Nodes' : 'People';
  const listId = id ? `${id}-mention-list` : 'mention-list';
  const sourceEmpty = sourceItems.length === 0;

  const picker =
    pickerOpen && pickerStyle ? (
      <div
        className="mention-picker"
        style={pickerStyle}
        role="listbox"
        id={listId}
        aria-label={`${pickerLabel} suggestions`}
        onMouseDown={(e) => e.preventDefault()}
      >
        <div className="mention-picker-header">{pickerLabel}</div>
        <ul className="mention-picker-list" ref={listRef}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <li key={`${mentionType}-${item.id}`}>
                <button
                  type="button"
                  role="option"
                  aria-selected={index === highlightIndex}
                  className={`mention-picker-item ${
                    index === highlightIndex ? 'mention-picker-item--active' : ''
                  }`}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    insertMention(item);
                  }}
                  onMouseEnter={() => setHighlightIndex(index)}
                >
                    {mentionType === 'node' && item.type ? (
                      <Chip
                        type={item.type}
                        name={item.label}
                        size="xs"
                        truncateLabel={false}
                        className="mention-picker-chip"
                      />
                    ) : (
                      <>
                        <span className="mention-picker-label">{item.label}</span>
                        {item.sublabel ? (
                          <span className="mention-picker-sublabel">{item.sublabel}</span>
                        ) : null}
                      </>
                    )}
                </button>
              </li>
            ))
          ) : (
            <li className="mention-picker-empty">
              {sourceEmpty
                ? mentionType === 'node'
                  ? 'No nodes on the graph'
                  : 'No people loaded'
                : 'No matches'}
            </li>
          )}
        </ul>
      </div>
    ) : null;

  return (
    <div className="mention-textarea-wrap">
      <textarea
        ref={textareaRef}
        id={id}
        className={`mention-textarea ${className}`.trim()}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onSelect={handleCursorSync}
        onClick={handleCursorSync}
        onKeyUp={handleCursorSync}
        onKeyDown={handleKeyDown}
        onBlur={() => {
          window.setTimeout(closePicker, 200);
        }}
        rows={rows}
        aria-label={ariaLabel}
        disabled={disabled}
        aria-expanded={pickerOpen}
        aria-autocomplete="list"
        aria-controls={pickerOpen ? listId : undefined}
      />

      {typeof document !== 'undefined' && picker
        ? createPortal(picker, document.body)
        : null}
    </div>
  );
}
