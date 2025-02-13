import React, { useEffect } from "react";
import useModifyCred from "../Utilities/useModifyCred";
import { obj } from "../Utilities/Constants";

const AddItemForm = ({ item, editItem }) => {
  useEffect(() => {
    if (!item.id) {
      resetValues();
    }
  }, [item]);

  const { editCred } = useModifyCred();

  const getType = (value) => (value === "password" ? "password" : typeof value);

  const resetValues = () => {
    editItem(obj);
    document.getElementById("addCredForm-id").reset();
    document.getElementById("service-input").focus();
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
      const result = { ...item, ...data };
      editCred(result);
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
            <div key={`${key}-id`} className="flex-start flex-column padding-md">
              <label className="label">{key.toUpperCase()}</label>
              <input
                id={`${key}-input`}
                className="input_class padding-md"
                placeholder={key}
                name={key}
                type={getType(value)}
                defaultValue={value}
              />
            </div>
          );
        })}
        <button className="button_primary full-width" type="submit">Save</button>
      </form>
    </div>
  );
};

export default AddItemForm;
