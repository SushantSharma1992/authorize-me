import React from "react";
import useModifyCred from "../../Utilities/CustomHooks/useModifyCred";
import CardMenu from "./CardMenu";
import Notes from "./Notes";
import Username from "./Username";

const getServiceData = (url, name) => {
  return url ? (
    <a target="_blank" rel="noreferrer" href={url}>
      {name}
    </a>
  ) : (
    <div>{name}</div>
  );
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
        <Username label="" content={getServiceData(data.url, data.service)} />
        <CardMenu options={options} />
      </div>
      <Username label="Username" content={data.username} />
      <Username label="Password" content={data.password} />
      <Notes content={data.notes} tags={data.tags} />
    </div>
  );
}

export default Card;
