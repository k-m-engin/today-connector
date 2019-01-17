/**
 * Wrapper function for `connector.getAuthType()`
 *
 * @returns {Object} `AuthType` used by the connector.
 */
function getAuthType() {
  return connector.logAndExecute('getAuthType', null);
}

/**
 * Wrapper function for `connector.getConfig()`
 *
 * @param {Object} request Config request parameters.
 * @returns {Object} Connector configuration to be displayed to the user.
 */
function getConfig(request) {
  return connector.logAndExecute('getConfig', request);
}

/**
 * Wrapper function for `connector.isAdminUser()`
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
function isAdminUser() {
  return connector.logAndExecute('isAdminUser', null);
}

/**
 * Wrapper function for `connector.getSchema()`
 *
 * @param {Object} request Schema request parameters.
 * @returns {Object} Schema for the given request.
 */
function getSchema(request) {
  return connector.logAndExecute('getSchema', request);
}

/**
 * Wrapper function for `connector.getData()`
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
function getData(request) {
  return connector.logAndExecute('getData', request);
}
