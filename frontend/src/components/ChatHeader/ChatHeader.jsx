import { ChevronDown, PanelLeftOpen } from 'lucide-react';
import styles from './ChatHeader.module.css';

export default function ChatHeader({ isSidebarOpen, onShowSidebar }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {!isSidebarOpen && (
          <button
            type='button'
            className={styles.sidebarToggle}
            onClick={onShowSidebar}
            aria-label='Show sidebar'
            aria-expanded={false}
            title='Show sidebar'
          >
            <PanelLeftOpen size={20} />
          </button>
        )}
        <span>ChatGPT</span>
        <ChevronDown size={16} />
      </div>
      <div className={styles.right}>
        <div className={styles.avatar}>IT</div>
      </div>
    </header>
  );
}
