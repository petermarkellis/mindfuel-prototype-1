import React, { useState } from 'react';
import {
  IconInbox,
  IconCircle,
  IconCircleFilled,
  IconCornerUpLeft,
  IconCornerUpRight,
} from '@tabler/icons-react';
import { getAvatarUrl } from '../../utils/avatarUtils';
import OutlineButton from '../BaseComponents/OutlineButton';
import './Inbox.css';

const mockMessages = [
  {
    id: 1,
    subject: 'Portfolio graph is ready to review',
    sender: 'Mindfuel Team',
    avatarUrl: 'Female_5.webp',
    preview: 'The demo graph is loaded with eight nodes. Open Portfolio to pan, filter, and inspect lineage.',
    timestamp: '2 hours ago',
    isRead: false,
    body: {
      lead: 'The portfolio view is wired to Neon. Use it to validate layout, filters, and drawer details before sharing the prototype.',
      sections: [
        {
          title: 'Try first',
          items: [
            'Pan the graph and open a node to read metrics in the side drawer.',
            'Use the left panel search and type filters to narrow the canvas.',
            'Reset Demo restores the baseline layout from the header or graph controls.',
          ],
        },
        {
          title: 'Prototype limits',
          items: [
            'Inbox messages are mocked — not synced to a mail API.',
            'Some toolbar actions here are placeholders until messaging ships.',
          ],
        },
      ],
      signoff: '— Mindfuel team',
    },
  },
  {
    id: 2,
    subject: 'Graph controls and drawer updates',
    sender: 'System Notifications',
    avatarUrl: 'Male_6.webp',
    preview: 'Frosted control rail, Reset Demo, and themed drawer metrics are in this build.',
    timestamp: '1 day ago',
    isRead: true,
    body: {
      lead: 'Recent UI passes focused on the portfolio shell: clearer chrome, consistent tokens, and less generic blue accents.',
      sections: [
        {
          title: 'Changed',
          items: [
            'Graph control menu matches the frosted side panel treatment.',
            'Reset Demo runs the same baseline restore as the header action.',
            'Dark mode tokens apply across drawer, modals, and inbox.',
          ],
        },
      ],
      signoff: null,
    },
  },
];

function MessageProse({ body }) {
  if (!body) return null;
  return (
    <article className="inbox-prose">
      {body.lead && <p>{body.lead}</p>}
      {body.sections?.map((section) => (
        <section key={section.title}>
          <h3>{section.title}</h3>
          <ul>
            {section.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ))}
      {body.signoff && <p>{body.signoff}</p>}
    </article>
  );
}

const Inbox = () => {
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
  const [messages, setMessages] = useState(mockMessages);
  const unreadCount = messages.filter((m) => !m.isRead).length;

  const handleMessageSelect = (message) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === message.id ? { ...msg, isRead: true } : msg))
      );
    }
  };

  return (
    <div className="inbox flex flex-row h-[calc(100vh-2.5rem)] mt-10 ml-16 bg-[var(--app-bg)] text-[var(--app-text)] min-w-0">
      <aside className="inbox-rail flex flex-col min-h-0 shrink-0">
        <header className="inbox-rail__head">
          <h2 className="inbox-rail__title">Inbox</h2>
          <p className="inbox-rail__meta">
            {messages.length} messages · {unreadCount} unread
          </p>
        </header>

        <ul className="inbox-list flex-1 overflow-y-auto min-h-0" role="listbox" aria-label="Messages">
          {messages.map((message) => {
            const isSelected = selectedMessage?.id === message.id;
            return (
              <li key={message.id} role="presentation">
                <button
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleMessageSelect(message)}
                  className={`inbox-list__item ${isSelected ? 'inbox-list__item--selected' : ''}`}
                >
                  <span className="inbox-list__item-inner">
                    <span
                      className={`inbox-list__status ${
                        message.isRead ? 'inbox-list__status--read' : 'inbox-list__status--unread'
                      }`}
                      aria-hidden
                    >
                      {message.isRead ? (
                        <IconCircle className="w-2 h-2" strokeWidth={2} />
                      ) : (
                        <IconCircleFilled className="w-2 h-2" strokeWidth={2} />
                      )}
                    </span>

                    <img
                      src={getAvatarUrl(message.avatarUrl)}
                      alt=""
                      className="inbox-list__avatar"
                    />

                    <div className="inbox-list__body">
                      <span className="inbox-list__sender">{message.sender}</span>
                      <span
                        className={`inbox-list__subject ${
                          message.isRead ? 'inbox-list__subject--read' : 'inbox-list__subject--unread'
                        }`}
                      >
                        {message.subject}
                      </span>
                      <span className="inbox-list__preview">{message.preview}</span>
                      <span className="inbox-list__time">{message.timestamp}</span>
                    </div>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section className="inbox-reading" aria-label="Message">
        {selectedMessage ? (
          <>
            <header className="inbox-reading__toolbar">
              <div className="inbox-reading__head flex items-start gap-3 min-w-0 mb-4 text-left">
                <img
                  src={getAvatarUrl(selectedMessage.avatarUrl)}
                  alt=""
                  className="inbox-list__avatar w-10 h-10"
                />
                <div className="min-w-0 flex-1">
                  <h1 className="inbox-reading__subject">{selectedMessage.subject}</h1>
                  <p className="inbox-reading__from">
                    From {selectedMessage.sender}
                    {' · '}
                    <time dateTime="PT2H">{selectedMessage.timestamp}</time>
                  </p>
                </div>
              </div>

              <div className="inbox-reading__actions">
                <div className="inbox-reading__actions-group">
                  <OutlineButton title="Delete (prototype)">
                    Delete
                  </OutlineButton>
                  <OutlineButton title="Forward (prototype)">
                    <IconCornerUpRight className="w-4 h-4" strokeWidth={2} aria-hidden />
                    Forward
                  </OutlineButton>
                  <OutlineButton title="Archive (prototype)">
                    Archive
                  </OutlineButton>
                </div>
                <button
                  type="button"
                  className="inbox-btn inbox-btn--reply"
                  title="Reply (prototype)"
                >
                  <IconCornerUpLeft className="w-4 h-4" strokeWidth={2} aria-hidden />
                  Reply
                </button>
              </div>
            </header>

            <div className="inbox-reading__body">
              <MessageProse body={selectedMessage.body} />
            </div>
          </>
        ) : (
          <div className="inbox-empty">
            <IconInbox className="inbox-empty__icon" strokeWidth={1.5} aria-hidden />
            <h2 className="inbox-empty__title">No message selected</h2>
            <p className="inbox-empty__text">
              Pick a thread from the list to read prototype notes and release notes.
            </p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Inbox;
