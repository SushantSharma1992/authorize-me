import React from "react";

const ICONS = {
  edit: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
  ),
  delete: (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
  ),
};

export default function MenuItems({ options }) {
  return (
    <>
      {options.map((item) => (
        <button
          key={item.name}
          type="button"
          className={`dropdownItem${item.danger ? " dropdownItem--danger" : ""}`}
          onClick={item.onClick}
        >
          {item.icon && ICONS[item.icon]}
          {item.name}
        </button>
      ))}
    </>
  );
}
