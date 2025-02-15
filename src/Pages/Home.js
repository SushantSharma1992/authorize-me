import React, { useState } from "react";
import Card from "../Components/Card/Card";
import Modal from "../Components/Modal";
import Search from "../Components/Search";
import Toast from "../Components/Toast";
import { obj } from "../Utilities/Constants";
import useSearch from "../Utilities/CustomHooks/useSearch";
import AddItem from "./AddItem";
import AddItemForm from "./AddItemForm";
import Settings from "./Settings";

function Home() {
  const [searchResults, findQuery] = useSearch();
  const [openForm, setOpenForm] = useState();
  const [editCred, setEditCred] = useState(obj);

  const toggleForm = () => {
    setOpenForm((prev) => !prev);
  };

  const editItem = (item) => {
    toggleForm();
    setEditCred(item);
  };

  return (
    <div className="home-container">
      <Modal isOpen={openForm} onClose={toggleForm}>
        <AddItemForm item={editCred} editItem={setEditCred} />
      </Modal>
      <div className="credential-container">
        {searchResults.map((cred) => {
          return <Card key={cred.id} data={cred} editItem={editItem} />;
        })}
        <Toast />
      </div>
      <div className="headerContainer full_width">
        <div className="flex_horizontal">
          <Search findQuery={findQuery} />
          <AddItem
            handleClick={() => {
              editItem(obj);
            }}
          />
          <Settings />
        </div>
      </div>
    </div>
  );
}

export default Home;
