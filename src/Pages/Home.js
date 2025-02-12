import React, { useContext, useState } from "react";
import Card from "../Components/Card/Card";
import Search from "../Components/Search";
import SettingsMenu from "../Components/SettingsMenu";
import Toast from "../Components/Toast";
import { AppContext } from "../GlobalStore/Context";
import useSearch from "../Utilities/useSearch";
import AddItem from "./AddItem";
import Modal from "../Components/Modal";
import AddItemForm from "./AddItemForm";
import { obj } from "../Utilities/Constants";
import useModifyCred from "../Utilities/useModifyCred";

function Home() {
  const { showToast } = useContext(AppContext);
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
        <AddItemForm formObj={editCred} />
      </Modal>
      <div className="credential-container">
        {searchResults.map((cred) => {
          return <Card key={cred.id} data={cred} editItem={editItem} />;
        })}
        {showToast && <Toast content="Copied!" />}
      </div>
      <div className="headerContainer full_width">
        <div className="flex_horizontal">
          <Search findQuery={findQuery} />
          <AddItem openForm={openForm} handleClick={toggleForm} />
          <SettingsMenu />
        </div>
      </div>
    </div>
  );
}

export default Home;
