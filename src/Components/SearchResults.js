import React from "react";

export default function SearchResults({ items, onClickAction, keys2Search }) {
  const getText = (item) => {
    let text='';
    for (let index = 0; index < keys2Search.length; index++) {
      const element = keys2Search[index];
      text = `${text} ${item[element]}`;
    }
    return text;
  };

  return (
    <div className='searchResults'>
      {items.map((value) => {
        const item = value.item;
        return (
          <div
            key={item.id}
            className="search_result_item"
            onClick={() => {
              onClickAction(item);
            }}
          >
            {getText(item)}
          </div>
        );
      })}
    </div>
  );
}
