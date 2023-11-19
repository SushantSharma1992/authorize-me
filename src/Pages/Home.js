import React, { useContext } from "react";
import Card from "../Components/Card/Card";
import Search from "../Components/Search";
import SettingsMenu from "../Components/SettingsMenu";
import Toast from "../Components/Toast";
import { AppContext } from "../GlobalStore/Context";
import useSearch from "../Utilities/useSearch";

function Home() {
  const { showToast } = useContext(AppContext);
  const [searchResults, findQuery] = useSearch();

  return (
    <div className="home-container">
      <div className="headerContainer">
        <div className="flex_horizontal">
          <Search findQuery={findQuery} />
          <button type="button" className="headerItem">
            + Add
          </button>
        </div>
        <SettingsMenu />
      </div>
      <div className="credential-container">
        {searchResults.map((cred) => {
          return <Card key={cred.id} data={cred} />;
        })}
        {showToast && <Toast content="Copied!" />}
      </div>
    </div>
  );
}

export default Home;
