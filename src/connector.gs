var DEBUG = true;
var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
var MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

/** Define namespace */
var connector = connector || {};

/** @const */
connector.logEnabled = true;

/**
 * Returns the authentication method required by the connector to authorize the
 * third-party service.
 *
 * Required function for Community Connector.
 *
 * @returns {Object} `AuthType` used by the connector.
 */
connector.getAuthType = function () {
  var response = {type: 'NONE'};
  return response;
};

/**
 * Builds the Community Connector config.
 * @return {Config} The Community Connector config.
 * @see https://developers.google.com/apps-script/reference/data-studio/config
 */
connector.getConfig = function (request) {
  var cc = DataStudioApp.createCommunityConnector();
  var config = cc.getConfig();

  config.newInfo()
      .setId('instructions')
      .setText('Enter date configuration.');

  config.newTextInput()
      .setId('dateFormat')
      .setName('Date String Format')
      .setHelpText('See https://momentjs.com/docs/#/displaying/ for formatting details.')
      .setPlaceholder('YYYY MM DD')
      .setAllowOverride(true);

  config.setDateRangeRequired(true);
  
  return config.build();
}

/**
 * Builds the Community Connector fields object.
 * @return {Fields} The Community Connector fields.
 * @see https://developers.google.com/apps-script/reference/data-studio/fields
 */
connector.getFields = function (request) {
  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  var aggregations = cc.AggregationType;

  fields.newDimension()
      .setId('todaysDateString')
      .setName('Todays Date String')
      .setDescription("Today's date in the format specified in the Connector configuration.")
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('todaysYear')
      .setName('Todays Year')
      .setDescription("Today's year as a YEAR.")
      .setType(types.YEAR);
  
  fields.newDimension()
      .setId('todaysMonth')
      .setName('Todays Month')
      .setDescription("Today's month as a MONTH.")
      .setType(types.MONTH);
  
  fields.newDimension()
      .setId('todaysMonthName')
      .setName('Todays Month Name')
      .setDescription("Today's month name as a STRING.")
      .setType(types.TEXT);
  
  fields.newDimension()
      .setId('todaysWeek')
      .setName('Todays Week')
      .setDescription("Today's week as a WEEK.")
      .setType(types.WEEK);
  
  fields.newDimension()
      .setId('todaysDay')
      .setName('Todays Day')
      .setDescription("Today's day as a DATETIME.")
      .setType(types.DAY);
  
  fields.newDimension()
      .setId('dayOfWeek')
      .setName('Todays day of the week')
      .setDescription("Today's day of the week as a STRING.")
      .setType(types.TEXT);  
 
  return fields;
}

/**
 * Builds the Community Connector schema.
 * @param {object} request The request.
 * @return {object} The schema.
 */
connector.getSchema = function (request) {
  var fields = connector.getFields(request).build();
  return { schema: fields };
}

/**
 * Returns the tabular data for the given request.
 *
 * @param {Object} request Data request parameters.
 * @returns {Object} Contains the schema and data for the given request.
 */
connector.getData = function (request) {

  // Create schema for requested fields
  var requestedFieldIds = request.fields.map(function(field) {
    return field.name;
  });
  var requestedFields = connector.getFields().forIds(requestedFieldIds);
  
  var today = new Date();
  
  var data = [
    {
      "todaysDateString": moment().format(request.configParams.dateFormat),
      "todaysYear": today.getFullYear().toString(),
      "todaysMonth": (today.getMonth() + 1).toString(),
      "todaysMonthName": MONTHS[today.getMonth()],
      "todaysWeek": moment().format('WW'),
      "todaysDay": today.getDate().toString(),
      "dayOfWeek": DAYS[today.getDay()],
    },
  ]
    
  // Transform parsed data and filter for requested fields
  var rows = connector.responseToRows(requestedFields, data);
  
  return {
    schema: requestedFields.build(),
    rows: rows
  };
}
    
connector.responseToRows = function (requestedFields, response) {
  // Transform parsed data and filter for requested fields
  return response.map(function(element) {
    var row = [];
    requestedFields.asArray().forEach(function (field) {
      var key = field.getId()
      
      if(key in element){
        return row.push(element[key])
      } else {
        return row.push('');
      }      
    });
    return { values: row };
  });
}
    
/**
 * Takes date input in Unix epoch and return in YYYYMMDD format. Returns '' if
 * input is undefined or null.
 *
 * @param {int} date Unix epoch.
 * @returns {string} Date in YYYYMMDD format.
 */
connector.formatDate = function(date) {
  if (!date) {
    return '';
  }
  var dateObj = new Date(date * 1000);
  return dateObj
    .toISOString()
    .slice(0, 10)
    .replace(/-/g, '');
};

/**
 * This checks whether the current user is an admin user of the connector.
 *
 * @returns {boolean} Returns true if the current authenticated user at the time
 * of function execution is an admin user of the connector. If the function is
 * omitted or if it returns false, then the current user will not be considered
 * an admin user of the connector.
 */
connector.isAdminUser = function() {
  return true;
};

/**
 * Stringifies parameters and responses for a given function and logs them to
 * Stackdriver.
 *
 * @param {string} functionName Function to be logged and executed.
 * @param {Object} parameter Parameter for the `functionName` function.
 * @returns {any} Returns the response of `functionName` function.
 */
connector.logAndExecute = function(functionName, parameter) {
  if (connector.logEnabled && connector.isAdminUser()) {
    var paramString = JSON.stringify(parameter, null, 2);
    console.log([functionName, 'request', paramString]);
  }

  var returnObject = connector[functionName](parameter);

  if (connector.logEnabled && connector.isAdminUser()) {
    var returnString = JSON.stringify(returnObject, null, 2);
    console.log([functionName, 'response', returnString]);
  }

  return returnObject;
};