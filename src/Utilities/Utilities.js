export const importData = (evt) => {
    const fileObj = evt.target.files[0];
    const reader = new FileReader();
    let fileloaded = (e) => {
      const fileContents = e.target.result;
      return JSON.parse(fileContents);
    };
    reader.onload = fileloaded;
    reader.readAsText(fileObj);
  };
  export const getDownloadURL = (data) => {
    const output = localStorage.getItem(data);
    const blob = new Blob([output]);
    const fileDownloadURL = URL.createObjectURL(blob);
    return fileDownloadURL;
  };

  export const higlightInList = (item) => {
    const itemDom = document.getElementById(item.id);
    itemDom.scrollIntoView();
    itemDom.click();
    itemDom.focus();
  };

  export const serializeForExport = (credentials) =>
    JSON.stringify(credentials, null, 2);

  export const mergeProductList = (oldList, newList) => {
    const updatedList = oldList.slice();
  
    newList.forEach((newItem) => {
      let matchFound = updatedList.find((item) => {
        return item.id === newItem.id;
      });
      if (matchFound) {
        const oldItemDate = new Date(matchFound.updatedOn);
        const newItemDate = new Date(newItem.updatedOn);
        if (oldItemDate - newItemDate < 0) {
          updatedList.pop(matchFound);
          updatedList.push(newItem);
        }
      } else {
        updatedList.push(newItem);
      }
    });
    return updatedList;
  };