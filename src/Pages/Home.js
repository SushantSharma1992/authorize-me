import React, { useContext } from "react";
import Card from "../Components/Card/Card";
import Toast from "../Components/Toast";
import { AppContext } from "../GlobalStore/Context";

function Home() {
  const { showToast } = useContext(AppContext);
  return (
    <div>
      <Card />
      {showToast && <Toast content='Copied!' />}
    </div>
  );
}

export default Home;
