import {
  MessageSquare,
  Search,
  Trash2,
  Image as ImageIcon,
  LayoutGrid,
  Microscope,
  Code2,
  FolderKanban,
  PanelLeftClose,
} from 'lucide-react';
import styles from './Sidebar.module.css';

export default function Sidebar({ chats, activeChatId, onNewChat, onSelectChat, onDeleteChat, isLoading, onHideSidebar }) {
  return (
    <aside id="chat-sidebar" className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.logo}>
          <button
            type='button'
            className={styles.iconBtn}
            onClick={onHideSidebar}
            aria-label='Hide sidebar'
            aria-expanded={true}
            aria-controls='chat-sidebar'
            title='Hide sidebar'
          >
            <PanelLeftClose size={20} />
          </button>
        </div>
        <button className={styles.iconBtn} onClick={onNewChat} disabled={isLoading} aria-label="New chat">
          <MessageSquare size={20} />
        </button>
      </div>

      <nav className={styles.nav}>
        <button type='button' className={styles.item} onClick={onNewChat} disabled={isLoading}>
          <MessageSquare size={18} />
          <span>New chat</span>
        </button>
        <a href='#' className={styles.item}>
          <Search size={18} />
          <span>Search chats</span>
        </a>
        <a href='#' className={styles.item}>
          <ImageIcon size={18} />
          <span>Images</span>
        </a>
        <a href='#' className={styles.item}>
          <LayoutGrid size={18} />
          <span>Apps</span>
        </a>
        <a href='#' className={styles.item}>
          <Microscope size={18} />
          <span>Deep research</span>
        </a>
        <a href='#' className={styles.item}>
          <Code2 size={18} />
          <span>Codex</span>
        </a>
        <a href='#' className={styles.item}>
          <FolderKanban size={18} />
          <span>Projects</span>
        </a>
      </nav>

      <section className={styles.history} aria-label='Chat history'>
        <h2 className={styles.historyTitle}>Your chats</h2>
        {chats.length === 0 && <p className={styles.empty}>No chats yet</p>}
        {chats.map(chat => (
          <div key={chat.id} className={styles.chatRow + ' ' + (activeChatId === chat.id ? styles.active : '')}>
            <button
              className={styles.chatTitle}
              onClick={() => onSelectChat(chat.id)}
              disabled={isLoading}
              aria-current={activeChatId === chat.id ? 'true' : undefined}
              title={chat.title}
            >
              {chat.title}
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => onDeleteChat(chat.id)}
              disabled={isLoading}
              aria-label={'Delete chat: ' + chat.title}
              title='Delete chat'
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </section>
    </aside>
  );
}
