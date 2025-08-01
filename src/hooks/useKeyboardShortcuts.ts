import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  callback: () => void;
  description: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when user is typing in input fields
    const target = event.target as HTMLElement;
    const isTyping = target.tagName === 'INPUT' || 
                    target.tagName === 'TEXTAREA' || 
                    target.contentEditable === 'true';
    
    if (isTyping) return;

    for (const shortcut of shortcuts) {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = !!shortcut.ctrl === event.ctrlKey;
      const altMatches = !!shortcut.alt === event.altKey;
      const shiftMatches = !!shortcut.shift === event.shiftKey;
      const metaMatches = !!shortcut.meta === event.metaKey;

      if (keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.callback();
        break;
      }
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};

// Common shortcut presets
export const createCommonShortcuts = (handlers: {
  onNew?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  onSearch?: () => void;
  onRefresh?: () => void;
  onEscape?: () => void;
  onDuplicate?: () => void;
}) => {
  const shortcuts: KeyboardShortcut[] = [];

  if (handlers.onNew) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      callback: handlers.onNew,
      description: 'Tạo mới (Ctrl+N)',
    });
  }

  if (handlers.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      callback: handlers.onSave,
      description: 'Lưu (Ctrl+S)',
    });
  }

  if (handlers.onDelete) {
    shortcuts.push({
      key: 'Delete',
      callback: handlers.onDelete,
      description: 'Xóa (Delete)',
      preventDefault: false,
    });
  }

  if (handlers.onSearch) {
    shortcuts.push({
      key: 'k',
      ctrl: true,
      callback: handlers.onSearch,
      description: 'Tìm kiếm (Ctrl+K)',
    });
  }

  if (handlers.onRefresh) {
    shortcuts.push({
      key: 'r',
      ctrl: true,
      callback: handlers.onRefresh,
      description: 'Làm mới (Ctrl+R)',
    });
  }

  if (handlers.onEscape) {
    shortcuts.push({
      key: 'Escape',
      callback: handlers.onEscape,
      description: 'Đóng/Hủy (Esc)',
      preventDefault: false,
    });
  }

  if (handlers.onDuplicate) {
    shortcuts.push({
      key: 'd',
      ctrl: true,
      callback: handlers.onDuplicate,
      description: 'Nhân bản (Ctrl+D)',
    });
  }

  return shortcuts;
};