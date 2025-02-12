import React from "react";
import CardMenu from "./CardMenu";
import Notes from "./Notes";
import Tags from "./Tags";
import Username from "./Username";
import useModifyCred from "../../Utilities/useModifyCred";

const getServiceData = (url, name) => {
  return <a href={url}>{name}</a>;
};

function Card({ data, editItem }) {
  const { deleteItem } = useModifyCred();

  const options = [
    {
      name: "Edit",
      onClick: () => {
        editItem(data);
      },
    },
    {
      name: "Delete",
      onClick: () => {
        deleteItem(data);
      },
    },
  ];

  return (
    <div className="CardComponent">
      <div className="flex_horizontal full_width">
        {data.tags && <Tags list={data.tags} />}
        <CardMenu options={options} />
      </div>
      <Username label="" content={getServiceData(data.url, data.service)} />
      <Username label="Username" content={data.username} />
      <Username label="Password" content={data.password} />
      <Notes content={data.notes} />
    </div>
  );
}

export default Card;
