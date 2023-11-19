function readFile(params) {}
function writeFile(params) {}

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