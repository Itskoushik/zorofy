import React from "react";

const barCount = 9;

export default function ZorofyAudioLoader({
  size = "medium",
  mode = "loading",
  label = "",
  className = "",
}) {
  return (
    <div
      className={`zorofy-loader zorofy-loader--${size} zorofy-loader--${mode} ${className}`}
      role="status"
      aria-label={label || "Audio level visualization"}
      aria-live="polite"
    >
      <span className="zorofy-loader__bars" aria-hidden="true">
        {Array.from({ length: barCount }, (_, index) => (
          <i key={index} style={{ "--bar-index": index }} />
        ))}
      </span>
      {label && <span className="zorofy-loader__label">{label}</span>}
    </div>
  );
}
