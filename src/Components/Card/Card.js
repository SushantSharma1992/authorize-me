import React from "react";
import useModifyCred from "../../Utilities/CustomHooks/useModifyCred";
import Avatar from "./Avatar";
import CardMenu from "./CardMenu";
import Notes from "./Notes";
import PasswordField from "./PasswordField";
import StrengthMeter from "./StrengthMeter";
import Username from "./Username";

function Card({ data, editItem }) {
  const { deleteItem } = useModifyCred();

  const options = [
    { name: "Edit", icon: "edit", onClick: () => editItem(data) },
    { name: "Delete", icon: "delete", danger: true, onClick: () => deleteItem(data) },
  ];

  return (
    <div className="cred-card">
      <div className="cred-card__head">
        <Avatar name={data.service} />
        <div className="cred-site-wrap">
          <div className="cred-site">
            {data.url ? (
              <a target="_blank" rel="noreferrer" href={data.url}>
                {data.service}
              </a>
            ) : (
              data.service
            )}
          </div>
          <div className="cred-url">{data.url}</div>
        </div>
        <CardMenu options={options} />
      </div>

      <Username label="Username" value={data.username} />
      <PasswordField password={data.password} />
      <Notes content={data.notes} />
      <StrengthMeter password={data.password} updated={data.updateOn || data.createdOn} />
    </div>
  );
}

export default Card;
