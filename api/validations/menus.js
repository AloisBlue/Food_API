// imports
import Validator from "validator";

// local imports
import isEmpty from "./isEmpty";

const validateMenuInput = (data) => {
  const errors = {};

  data.item = !isEmpty(data.item) ? data.item : '';
  data.price = !isEmpty(data.price) ? data.price : '';
  data.description = !isEmpty(data.description) ? data.description : '';
  // data.menuImage = !isEmpty(data.menuImage) ? data.menuImage : '';

  if (!Validator.isLength(data.item, { min: 2, max: 20 })) {
    errors.item = 'Item should be between 2 and 20 characters'
  }

  if (Validator.isEmpty(data.item)) {
    errors.item = 'Item field is required'
  }

  if (!Validator.isFloat(data.price)) {
    errors.price = 'Price should be in float number format only'
  }

  if (Validator.isEmpty(data.price)) {
    errors.price = 'Price field is required'
  }

  if (!Validator.isLength(data.description, { min: 5, max: 100 })) {
    errors.description = 'Description should be between 5 and 100 characters'
  }

  if (Validator.isEmpty(data.description)) {
    errors.description = 'Description field is required'
  }

  // if (Validator.isEmpty(data.menuImage)) {
  //   errors.menuImage = 'Menu image field is required'
  // }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}

export default validateMenuInput;
