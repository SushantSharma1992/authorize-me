import React from "react";

const loadData = () => {
  const credentials = JSON.parse(localStorage.getItem(SavedData.CREDENTIALS));

  if (!savedCartItems || savedCartItems?.length === 0) {
    savedCartItems = [];
  }

  let itemList;
  if (savedItemsList || savedItemsList?.length > 0) {
    itemList = savedItemsList;
  } else {
    itemList = [defaultObject];
  }

  if (!savedHistoryList || savedHistoryList?.length === 0) {
    savedHistoryList = [];
  }
  return <div></div>;
};

export default loadData;
