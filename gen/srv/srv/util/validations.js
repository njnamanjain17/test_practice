const regEx = /^[0-9a-zA-Z]+$/;
const errConstants = require("../util/errorcodes-constants.js");
const constants = require("../util/constant-util.js");
/**
 * Function to validate input details
 * Function Invoked in - sendDataToUpload()
 * @param {Array} dataToUpload 
 */
async function validateRequest(dataToUpload) {
    let validationResult;
    let isValidated;
    let data;
    if (dataToUpload !== null) {
        for (let i in dataToUpload) {
            let row = dataToUpload[i];
            if (row.Personnel_Number.toString().length === 8) {
                isValidated = true;
                data = constants.LOG_VALID_DATA;
                validationResult = { isValidated, data };
            } else {
                isValidated=false;
                data= errConstants.LOG_INVALID_PERSONNEL_NUM;
                validationResult ={isValidated,data}
                return validationResult
            }
            if (row.Wagetype_Description.length <= 100) {
                isValidated = true;
                data = constants.LOG_VALID_DATA;
                validationResult = { isValidated, data };
            } else {
                isValidated=false;
                data= errConstants.LOG_INVALID_WAGE_DESC;
                validationResult ={isValidated,data}
                return validationResult;
            }
            if (row.WBS.toString().length === 8
                && row.WBS.match(regEx)) {
                    isValidated = true;
                    data = constants.LOG_VALID_DATA;
                    validationResult = { isValidated, data };
            } else {
                isValidated=false;
                data= errConstants.LOG_INVALID_WBS;
                validationResult ={isValidated,data}
                return validationResult;
            }
        }
    } else {
        isValidated = false;
        data= errConstants.LOG_INVALID_INPUT;
        return validationResult;
    }
    return validationResult;
}
module.exports.validateRequest = validateRequest;