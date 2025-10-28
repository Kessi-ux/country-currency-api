// utils/errorHandlerApi.js
const axios = require('axios');

/**
 * Send consistent JSON error responses
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Main error message
 * @param {string|null} details - Optional extra details
 */
const sendError = (res, statusCode, message, details = null) => {
  const response = { error: message };
  if (details) response.details = details;
  return res.status(statusCode).json(response);
};

/**
 * Safely fetch data from an external API
 * If API fails or times out, sends a 503 error
 * and returns null (caller must stop execution)
 *
 * @param {Object} res - Express response
 * @param {string} url - API URL
 * @param {string} apiName - API name for error details
 * @param {number} timeout - optional timeout in ms
 */
const fetchExternalAPI = async (res, url, apiName, timeout = 8000) => {
  try {
    const response = await axios.get(url, { timeout });
    if (!response.data) {
      sendError(res, 503, 'External data source unavailable', `Empty response from ${apiName}`);
      return null;
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${apiName}:`, error.message);
    sendError(res, 503, 'External data source unavailable', `Could not fetch data from ${apiName}`);
    return null;
  }
};

module.exports = {
  sendError,
  fetchExternalAPI,
};
