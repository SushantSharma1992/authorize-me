import React from "react";
import CardMenu from "./CardMenu";
import Notes from "./Notes";
import Tags from "./Tags";
import Username from "./Username";

const getServiceData = (url, name) => {
  return <a href={url}>{name}</a>;
};

function Card({ data }) {
  return (
    <div className="CardComponent">
      <div className="paddingright">

      <Username label="" content={getServiceData(data.url, data.service)} />
      </div>
      <CardMenu />
      {data.tags && <Tags list={data.tags} />}
      <Username label="Username" content={data.username} />
      <Username label="Password" content={data.password} />
      <Notes content={data.notes}/>
    </div>
  );
}

export default Card;
