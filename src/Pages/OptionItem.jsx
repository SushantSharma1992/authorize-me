import React from "react";
import PropTypes from "prop-types";

function OptionItem(props) {
  const { description, image, onClick, hiddenElement } = props;
  return (
    <>
      <div className="option_row" onClick={onClick}>
        <span className="option_description">{description}</span>
        <span className="option_image_container">{image}</span>
      </div>
      {hiddenElement}
    </>
  );
}

OptionItem.prototype = {
  description: PropTypes.String,
  image: PropTypes.Object,
  onClick: PropTypes.Function,
};
export default OptionItem;
