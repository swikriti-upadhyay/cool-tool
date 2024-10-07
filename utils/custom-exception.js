function CustomException(message, code = 0) { // 0 not set
    const error = new Error(message);
    error.code = code;
    return error;
  }
  
CustomException.prototype = Object.create(Error.prototype);

export { CustomException }