import React, { useContext, useState } from "react";
import Card from "../Components/Card/Card";
import Modal from "../Components/Modal";
import Search from "../Components/Search";
import Toast from "../Components/Toast";
import { AppContext } from "../GlobalStore/Context";
import { obj } from "../Utilities/Constants";
import useSearch from "../Utilities/CustomHooks/useSearch";
import AddItem from "./AddItem";
import AddItemForm from "./AddItemForm";
import Settings from "./Settings";

function Home() {
  const { credentials } = useContext(AppContext);
  const [searchResults, findQuery] = useSearch();
  const [openForm, setOpenForm] = useState(false);
  const [editCred, setEditCred] = useState(obj);

  const toggleForm = () => setOpenForm((prev) => !prev);
  const editItem = (item) => {
    setEditCred(item);
    setOpenForm(true);
  };

  return (
    <div className="vault-page">
      <Modal isOpen={openForm} onClose={toggleForm}>
        <AddItemForm item={editCred} editItem={setEditCred} onClose={toggleForm} />
      </Modal>

      <div className="vault-header">
        <div>
          <div className="vault-eyebrow">Vault</div>
          <div className="vault-title">Credentials</div>
        </div>
        <div className="vault-count">
          {searchResults.length} of {credentials.length} items
        </div>
      </div>

      <div className="vault-scroll">
        <div className="vault-inner">
          {searchResults.length > 0 ? (
            <div className="cred-grid">
              {searchResults.map((cred) => (
                <Card key={cred.id} data={cred} editItem={editItem} />
              ))}
            </div>
          ) : (
            <div className="vault-empty">
              <div className="vault-empty__icon">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/></svg>
              </div>
              <div className="vault-empty__title">No matches found</div>
              <div className="vault-empty__sub">Try a different search term.</div>
            </div>
          )}
        </div>
      </div>

      <div className="vault-bar">
        <div className="vault-bar__inner">
          <Search findQuery={findQuery} />
          <AddItem handleClick={() => editItem(obj)} />
          <Settings />
        </div>
      </div>

      <Toast />
    </div>
  );
}

export default Home;
