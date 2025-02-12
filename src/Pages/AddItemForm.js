import React, { useState } from "react";
import { obj } from "../Utilities/Constants";
import useModifyCred from "../Utilities/useModifyCred";

const AddItemForm = ({ formObj }) => {
  const [item, setItem] = useState(formObj);
  const { editCred } = useModifyCred();

  const getType = (value) => typeof value;

  const resetValues = () => {
    document.getElementById("addCredForm-id").reset();
    document.getElementById("service-input").focus();
    // setItem(obj);
  };
  const getObject = (target) => {
    const element = [];
    const tags = [];
    let quantity = "";
    for (let index = 0; index < target.length; index++) {
      if (target[index].type !== "button" && target[index].type !== "submit") {
        if (target[index].name === "quantity") {
          quantity = [target[index].value];
        } else if (target[index].name === "price") {
          if (target[index].value) {
            tags.push({ quantity, [target[index].name]: target[index].value });
          }
        } else {
          element.push({ [target[index].name]: target[index].value });
        }
      }
    }
    element.push({ tags });
    return Object.assign(...element);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    if (e.target[1].value) {
      const data = getObject(e.target);
      console.log({ data });
      editCred(data);
      resetValues();
    }
  };

  const isKeyAllowed = (key) => {
    let isAllowed = false;
    const removeKyes = ["id", "createdOn", "updateOn"];
    removeKyes.forEach((element) => {
      isAllowed = isAllowed || key === element;
    });
    return isAllowed;
  };

  return (
    <div>
      <form id="addCredForm-id" onSubmit={onSubmit}>
        {Object.entries(item).map(([key, value]) => {
          if (getType(value) === "object" || isKeyAllowed(key)) {
            return <></>;
          }
          return (
            <div key={`${key}-id`}>
              <label className="label">{key} : </label>
              <input
                id={`${key}-input`}
                placeholder={key}
                name={key}
                type={getType(value)}
                defaultValue={value}
              />
            </div>
          );
        })}
        <button type="submit">Save</button>
      </form>
    </div>
  );
};

export default AddItemForm;
