import React, { useState } from "react";
import useModifyCred from "../../Utilities/CustomHooks/useModifyCred";
import { avatarColor, hexToRgba } from "../../Utilities/display";
import Avatar from "./Avatar";
import CardMenu from "./CardMenu";
import NoteModal from "./NoteModal";
import PasswordField from "./PasswordField";
import Username from "./Username";

function Card({ data, editItem }) {
  const { deleteItem } = useModifyCred();
  const [noteOpen, setNoteOpen] = useState(false);

  const hasNotes = Boolean(data.notes);
  const accent = avatarColor(data.service);

  const options = [
    ...(hasNotes
      ? [{ name: "View note", icon: "note", onClick: () => setNoteOpen(true) }]
      : []),
    { name: "Edit", icon: "edit", onClick: () => editItem(data) },
    { name: "Delete", icon: "delete", danger: true, onClick: () => deleteItem(data) },
  ];

  return (
    <div
      className="cred-card"
      style={{ "--card-accent": accent, "--card-glow": hexToRgba(accent, 0.32) }}
    >
      <div className="cred-card__head">
        <Avatar name={data.service} />
        <div className="cred-site-wrap">
          <div className="cred-site">
            {data.url ? (
              <a target="_blank" rel="noreferrer" href={/^https?:\/\//i.test(data.url) ? data.url : `https://${data.url}`}>
                {data.service}
              </a>
            ) : (
              data.service
            )}
          </div>
          {data.url && <div className="cred-url">{data.url}</div>}
        </div>
        {hasNotes && (
          <button
            type="button"
            className="cred-note-btn"
            aria-label="View note"
            title="View note"
            onClick={() => setNoteOpen(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/></svg>
          </button>
        )}
        <CardMenu options={options} />
      </div>

      <Username label="Username" value={data.username} />
      <PasswordField password={data.password} />

      <NoteModal
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        service={data.service}
        notes={data.notes}
      />
    </div>
  );
}

export default Card;
