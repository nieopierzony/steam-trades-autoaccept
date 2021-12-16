'use strict';

const FormData = require('form-data');

module.exports = body => {
  const formData = new FormData();
  for (const [key, val] of Object.entries(body)) {
    formData.append(key, val);
  }
  return formData;
};
