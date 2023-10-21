import React from "react";
import Password from "./Password";
import Username from "./Username";
import Tags from "./Tags";

const getServiceData = (url, name) => {
  return <a href={url}>{name}</a>;
};

function Card() {
  const tagsList=['tag1','tag2','tag3',
  'tag4',
  'tag4',
  'tag4',
  'tag4',
  'tag4',
  'tag4',
  'tag4',
];
  return (
    <div className="CardComponent">
      {tagsList && <Tags list={tagsList}/>}
      {/* <Username
        label="Service"
        content={getServiceData("https://google.com", "Google")}
      /> */}
      <Username label="Username" content="Username" />
      <Username label="Password" content="password" />
    </div>
  );
}

export default Card;
