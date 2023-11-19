import Fuse from "fuse.js";
import { useContext, useState } from "react";
import { AppContext } from "../GlobalStore/Context";

export default function useSearch() {
  const { credentials } = useContext(AppContext);
  const [searchResults, setSearchResults] = useState(credentials);
  let fuse;
  const keys2Search = ["service", "username", "password"];
  const options = {
    includeScore: true,
    keys: keys2Search,
  };
  fuse = new Fuse(credentials, options);

  const runSearch = (query) => {
    const searchFuseOutput = fuse.search(query);
    let searchResult = [];
    searchFuseOutput.forEach((element) => {
      searchResult.push(element.item);
    });
    console.log({ searchFuseOutput });
    return searchResult;
  };

  const findQuery = (e) => {
    e.preventDefault();
    let query = e.target.value;

    setSearchResults(query ? runSearch(query) : credentials);
  };
  return [searchResults, findQuery];
}
