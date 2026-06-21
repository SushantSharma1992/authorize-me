import React, { useEffect, useState } from "react";
import useModifyCred from "../Utilities/CustomHooks/useModifyCred";

const AddItemForm = ({ item, editItem, onClose }) => {
  const { editCred } = useModifyCred();
  const [form, setForm] = useState({ service: "", username: "", password: "", notes: "" });

  useEffect(() => {
    setForm({
      service: item.service || "",
      username: item.username || "",
      password: item.password || "",
      notes: item.notes || "",
    });
  }, [item]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    if (!form.service.trim()) return;
    const url =
      (item.url || "").trim() ||
      form.service.trim().toLowerCase().replace(/\s+/g, "") + ".com";
    editCred({
      ...item,
      service: form.service.trim(),
      url,
      username: form.username.trim(),
      password: form.password,
      notes: form.notes.trim(),
    });
    if (editItem) editItem({ service: "", url: "", username: "", password: "", tags: [""], notes: "" });
    if (onClose) onClose();
  };

  return (
    <>
      <div className="vault-modal__head">
        <div className="vault-modal__title">
          {item.id ? "Edit credential" : "New credential"}
        </div>
        <button type="button" className="vault-modal__close" aria-label="Close" onClick={onClose}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
      </div>
      <form className="vault-form" onSubmit={onSubmit}>
        <div className="vault-field2">
          <label className="vault-field2__label" htmlFor="f-site">Website</label>
          <input id="f-site" className="vault-input" placeholder="e.g. Google" value={form.service} onChange={set("service")} autoFocus />
        </div>
        <div className="vault-field2">
          <label className="vault-field2__label" htmlFor="f-user">Username</label>
          <input id="f-user" className="vault-input vault-input--mono" placeholder="email or username" value={form.username} onChange={set("username")} />
        </div>
        <div className="vault-field2">
          <label className="vault-field2__label" htmlFor="f-pass">Password</label>
          <input id="f-pass" className="vault-input vault-input--mono" placeholder="password" value={form.password} onChange={set("password")} />
        </div>
        <div className="vault-field2">
          <label className="vault-field2__label" htmlFor="f-notes">Notes</label>
          <textarea id="f-notes" className="vault-textarea" rows="2" placeholder="Add a note…" value={form.notes} onChange={set("notes")} />
        </div>
        <div className="vault-form__actions">
          <button type="button" className="vault-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="vault-btn--primary">Save credential</button>
        </div>
      </form>
    </>
  );
};

export default AddItemForm;
