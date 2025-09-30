import { useEffect, useState } from 'react';

export default function KeyboardHint() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleFirstKeyPress = () => {
      if (!localStorage.getItem('keyboardHintShown')) {
        setShow(true);
        setTimeout(() => setShow(false), 3000);
        localStorage.setItem('keyboardHintShown', 'true');
      }
    };

    window.addEventListener('keydown', handleFirstKeyPress, { once: true });
    
    return () => {
      window.removeEventListener('keydown', handleFirstKeyPress);
    };
  }, []);

  return (
    <div
      className={`fixed bottom-5 right-5 bg-bg-secondary px-4 py-3 rounded-lg border border-border text-xs text-text-secondary transition-opacity pointer-events-none ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <strong>Keyboard shortcuts:</strong> ESC = Close, ↑↓ = Navigate, ←→ = Media Navigation
    </div>
  );
}
