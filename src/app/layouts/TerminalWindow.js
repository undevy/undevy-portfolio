// src/app/layouts/TerminalWindow.js
export default function TerminalWindow({ title, children }) {
  return (
    <div className="w-full max-w-4xl border border-dark-border rounded bg-dark-bg/50">
      {/* Header */}
      <div className="flex items-center justify-between p-2 border-b border-dark-border">
        <h1 className="text-dark-text-command font-bold text-lg">${title}</h1>
        <div className="flex items-center gap-3">
          {/* Theme switcher will go here */}
          <span className="text-dark-text-command text-xl">☼</span> 
          {/* Close button will go here */}
          <span className="text-dark-text-command text-xl">×</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}