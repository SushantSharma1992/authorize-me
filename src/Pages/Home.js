import React, { useContext } from "react";
import Card from "../Components/Card/Card";
import Toast from "../Components/Toast";
import { AppContext } from "../GlobalStore/Context";
import Search from "../Components/Search";

function Home() {
  const { showToast, credentials } = useContext(AppContext);

  return (
    <div className="home-container">
      <Search />
      <div className="credential-container">
        {credentials.map((cred) => {
          return <Card key={cred.id} data={cred} />;
        })}
        {showToast && <Toast content="Copied!" />}
      </div>
    </div>
  );
}

export default Home;
