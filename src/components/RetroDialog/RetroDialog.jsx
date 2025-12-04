import './RetroDialog.css';

const RetroDialog = ({ title, children, className = '' }) => {
  return (
    <div className={`retro-dialog ${className}`}>
      <div className="retro-dialog-titlebar">
        <span className="retro-dialog-bracket">[</span>
        <span className="retro-dialog-title">{title}</span>
        <span className="retro-dialog-bracket">]</span>
      </div>
      <div className="retro-dialog-content">
        {children}
      </div>
    </div>
  );
};

export default RetroDialog;
