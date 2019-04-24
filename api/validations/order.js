// imports
import Validator from "validator";

// local imports
import isEmpty from "./isEmpty";

const validateOrderInput = (data) => {
  const errors = {};

  data.item = !isEmpty(data.item) ? data.item : '';
  data.quantity = !isEmpty(data.quantity) ? data.quantity : '';

  if (Validator.isEmpty(data.item)) {
    errors.item = "The item field is required"
  }

  if (!Validator.isFloat(data.quantity)) {
    errors.quantity = "Quantity must be in digits"
  }

  if (Validator.isEmpty(data.quantity)) {
    errors.quantity = "The quantity field is required"
  }

  return {
    errors,
    isValid: isEmpty(errors)
  };
}

export default validateOrderInput;
