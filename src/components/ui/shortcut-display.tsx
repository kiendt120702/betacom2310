import React from 'react';
import { Badge } from '@/components/ui/badge';
import { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts';

interface ShortcutDisplayProps {
  shortcut: KeyboardShortcut;
  className?: string;
}

export const ShortcutDisplay = React.memo<ShortcutDisplayProps>(({ shortcut, className }) => {
  const keys = [];
  
  if (shortcut.ctrl) keys.push('Ctrl');
  if (shortcut.alt) keys.push('Alt');
  if (shortcut.shift) keys.push('Shift');
  if (shortcut.meta) keys.push('⌘');
  keys.push(shortcut.key.toUpperCase());

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {keys.map((key, index) => (
        <React.Fragment key={key}>
          <Badge variant="outline" className="px-1.5 py-0.5 text-xs font-mono">
            {key}
          </Badge>
          {index < keys.length - 1 && <span className="text-xs text-muted-foreground">+</span>}
        </React.Fragment>
      ))}
    </div>
  );
});

ShortcutDisplay.displayName = "ShortcutDisplay";

interface ShortcutHelpProps {
  shortcuts: KeyboardShortcut[];
  className?: string;
}

export const ShortcutHelp = React.memo<ShortcutHelpProps>(({ shortcuts, className }) => {
  if (shortcuts.length === 0) return null;

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-foreground">Phím tắt:</h4>
      <div className="space-y-1">
        {shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">{shortcut.description}</span>
            <ShortcutDisplay shortcut={shortcut} />
          </div>
        ))}
      </div>
    </div>
  );
});

ShortcutHelp.displayName = "ShortcutHelp";