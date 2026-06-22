import React, { useContext, useEffect, useRef, useState } from "react";
import MenuItems from "./MenuItem";
import Menu from "./Menu";
import { AppContext } from "../GlobalStore/Context";
import { SavedData } from "../Utilities/Constants";
import { mergeProductList } from "../Utilities/Utilities";
import { BsFiletypeJson } from "react-icons/bs";

export default function SettingsMenu() {
  
  const [downloadUrl, setDownloadUrl] = useState();
  const downloadButton = useRef();
  const importButton = useRef();
  const { credentials, setCredentials } = useContext(AppContext);
  let fileDownloadURL;

  useEffect(() => {
    if (downloadUrl) {
      downloadButton.current.click();
      URL.revokeObjectURL(fileDownloadURL);
    }
  }, [downloadUrl]);

  const upload = (e) => {
    e.preventDefault();
    importButton.current.click();
  };

  const importData = (evt) => {
    const fileObj = evt.target.files[0]; // We've not allowed multiple files.
    // See https://developer.mozilla.org/en-US/docs/Web/API/FileReader
    const reader = new FileReader();

    // Defining the function here gives it access to the fileObj constant.
    let fileloaded = (e) => {
      // e.target.result is the file's content as text
      // Don't trust the fileContents!
      // Test any assumptions about its contents!
      const fileContents = e.target.result;
      setCredentials(mergeProductList(credentials, JSON.parse(fileContents)));
    };

    // The fileloaded event handler is triggered when the read completes
    reader.onload = fileloaded;
    reader.readAsText(fileObj); // read the file
  };
  const downloadJsonData = (e) => {
    e.preventDefault();
    const output = localStorage.getItem(SavedData.credentials);
    const blob = new Blob([output]);
    fileDownloadURL = URL.createObjectURL(blob);
    setDownloadUrl(fileDownloadURL);
  };

  const settingOptions = [
    {
      name: "Export Data",
      image: <BsFiletypeJson  className="option_image" />,
      hiddenElement: (
        <a
          className="hidden"
          download={`CredData ${new Date()}.json`}
          href={downloadUrl}
          ref={downloadButton}
        >
          download
        </a>
      ),
      onClick: downloadJsonData,
    },
    {
      name: "Import Data",
      image: <BsFiletypeJson className="option_image" />,
      hiddenElement: (
        <input
          className="hidden"
          type="file"
          multiple={false}
          accept=".json"
          onChange={importData}
          ref={importButton}
        />
      ),
      onClick: upload,
    },
    {
      name: "Delete Data",
      image: <BsFiletypeJson className="option_image" />,
      hiddenElement: <></>,
      onClick: () => {
        setCredentials([]);
      },
    },
  ];

  return (
    <Menu dropUp={true}>
      <MenuItems options={settingOptions} />
    </Menu>
  );
}
