/**
 * Table chat UI in design pixels; same layout everywhere. When `disabled`, the
 * composer is inactive (e.g. lobby).
 */
import { useLayoutEffect, useRef } from 'react'

function ChatColumn({
  disabled = false,
  messages = [],
  messageDraft = '',
  onDraftChange,
  onSend,
  playerCount = 0,
  messageCount = 0,
}) {
  const messagesRef = useRef(null)

  useLayoutEffect(() => {
    if (disabled) return
    const el = messagesRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, disabled])

  function handleKeyDown(e) {
    if (disabled) return
    if (e.key === 'Enter') {
      e.preventDefault()
      onSend?.()
    }
  }

  const metaText = disabled
    ? 'Players: — · Messages: —'
    : `Players: ${playerCount} · Messages: ${messageCount}`

  const messageList = disabled ? (
    <p className="game-chat-column__empty">
      Join or create a table to use room chat.
    </p>
  ) : (
    messages.map((msg, index) => (
      <p className="message" key={`${msg.username}-${index}-${msg.message}`}>
        {msg.username}: {msg.message}
      </p>
    ))
  )

  return (
    <aside
      className="game-chat-column"
      aria-label={disabled ? 'Table chat (available when you join a table)' : 'Table chat'}
    >
      <div className="game-chat-column__meta">{metaText}</div>
      <div
        ref={messagesRef}
        className="messages"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messageList}
      </div>
      <div className="message-composer">
        <input
          type="text"
          className="message-composer-input"
          value={disabled ? '' : messageDraft}
          onChange={disabled ? undefined : (e) => onDraftChange?.(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Join a table to chat'
              : 'Message the room…'
          }
          aria-label="Message to the room"
          maxLength={500}
          autoComplete="off"
          disabled={disabled}
        />
        <button
          type="button"
          className="message-composer-send"
          onClick={disabled ? undefined : onSend}
          disabled={disabled}
        >
          Send
        </button>
      </div>
    </aside>
  )
}

export default ChatColumn
