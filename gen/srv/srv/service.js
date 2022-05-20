const cds = require('@sap/cds');
const datetime = require('node-datetime');
const logger = require('./util/logger.js');
const validate = require('./util/validations.js');
const constants = require("./util/constant-util.js");
const errConstants = require("./util/errorcodes-constants.js");
const dbData = require('./dao/db-dao.js');
const LG_SERVICE = 'Service: ';
const config = require('./config.js');
const { Yamaha } = cds.entities('app.deductions');

let seqIDValue;
module.exports = cds.service.impl(async function () {
    /**
     * Function to Upload Input Details into HANA DB
     */
    this.on('sendDataToUpload', async (req) => {
        try {
            let dt = datetime.create();
            let uploadedOn = dt.format('Y/m/d H:M:S').toString();
            let sUploadedBy = req.data.uploadedBy || null;
            let dataToUpload = req.data.payload || null;
            let sComments = req.data.comments || null;
            let deductionsUploadType = req.data.deductionsUploadType || null;
            let validatedResult = await validate.validateRequest(dataToUpload);
            let resultData;
            if (validatedResult.isValidated) {
                logger.getLogger(`${LG_SERVICE}${__filename}`, "sendDataToUpload", constants.LOG_INITIAL_COMMENT);
                seqIDValue = await dbData.createUploadId();
                if (seqIDValue.message) { return req.error(seqIDValue) }
                logger.getLogger(`${LG_SERVICE}${__filename}`, "sendDataToUpload", constants.LOG_UPLOADID);
                let deductionHistoryResult = await dbData.insertHistory(seqIDValue, uploadedOn, sUploadedBy, deductionsUploadType, req);
                if (deductionHistoryResult.message) { return req.error(deductionHistoryResult) }
                logger.getLogger(`${LG_SERVICE}${__filename}`, "sendDataToUpload", constants.LOG_HISTORY_DB);
                let insertionCommentResult = await dbData.insertComments(seqIDValue, uploadedOn, sUploadedBy, sComments, req);
                if (insertionCommentResult.message) { return req.error(insertionCommentResult) }
                logger.getLogger(`${LG_SERVICE}${__filename}`, "sendDataToUpload", constants.LOG_INSERT_COMMENT_DB);
                for (let i in dataToUpload) {
                    let row = dataToUpload[i];
                    if (row.Personnel_Number) {
                        let deductionUploadResult = await dbData.insertDeductionUploads(seqIDValue, row, req);
                        if (deductionUploadResult.message) { return req.error(deductionUploadResult) }
                    }
                }
                logger.getLogger(`${LG_SERVICE}${__filename}`, "sendDataToUpload", constants.LOG_UPLOAD_DB);
                config.response.body = {
                    sMessage: constants.LOG_INSERT_MSG,
                    uploadId: seqIDValue
                }
                resultData = {
                    data: config.response
                }
                logger.getLogger(`${LG_SERVICE}${__filename}`, "sendDataToUpload", constants.LOG_INSERT_RESPONSE);
                return resultData;
            } else {
                config.errResponse.body = validatedResult.data;
                config.errResponse.statusCode = 400;
                resultData = {
                    data: config.errResponse
                }
                return resultData;
            }
        }
        catch (err) {
            logger.getErrorLogger(`${LG_SERVICE}${__filename}`, "sendDataToUpload", errConstants.LOG_INSERT_ERR, err);
            config.errResponse.statusCode = err.statusCode || 500;
            config.errResponse.body = err.message || errConstants.LOG_UPLOAD_DOC_ERROR;
            return req.error(config.errResponse);
        }
    });

    /**
     * Function to Retrive Input Details from HANA DB based on uploadID
     */
    this.on('retriveUploadID', async (req) => {
        try {
            logger.getLogger(`${LG_SERVICE}${__filename}`, "retriveUploadID", constants.LOG_INITIAL_COMMENT);
            let deductionUpload = await dbData.getDeductionUploads(req);
            if (deductionUpload.message) { return req.error(deductionUpload) }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "retriveUploadID", constants.LOG_GET_UPLOAD_DB);
            let commentsResult = await dbData.getComments(req);
            if (commentsResult.message) { return req.error(commentsResult) }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "retriveUploadID", constants.LOG_GET_COMMENTS_DB);
            let deductionType = await dbData.getDeductionType(req);
            if (deductionType === null) {
                deductionType = "Car Rental";
                let updateDeductionTypeResult = await dbData.updateDeductionType(req, deductionType)
                if (updateDeductionTypeResult.message) { return req.error(updateDeductionTypeResult) }
            }
            if (deductionType.message) { return req.error(deductionType) }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "retriveUploadID", constants.LOG_GET_DEDUCTION_TYPE);
            config.response.body = { deductionType, deductionUpload, commentsResult }
            let resultData = {
                data: config.response
            }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "retriveUploadID", constants.LOG_RETRIVE_RESPONSE);
            return resultData;
        }
        catch (err) {
            logger.getErrorLogger(`${LG_SERVICE}${__filename}`, "retriveUploadID", errConstants.LOG_SELECT_ERR, err);
            config.errResponse.statusCode = err.statusCode || 500;
            config.errResponse.body = err.message || errConstants.LOG_RETRIVE_ERROR;
            return req.error(config.errResponse);
        }
    });

    /**
     * Function to Update Comment and Status into HANA DB based on input Details
     */
    this.on('postDeducations', async (req) => {
        try {
            let dt = datetime.create();
            let updatedOn = dt.format('Y/m/d H:M:S').toString();
            let uploadId = req.data.uploadID || null;
            let comments = req.data.comments || null;
            let userId = req.data.userId;
            logger.getLogger(`${LG_SERVICE}${__filename}`, "postDeducations", constants.LOG_INITIAL_COMMENT);
            let updateDeductionHistory = await dbData.updateDeductionHistoryTable(req, uploadId, updatedOn, req.data.status)
            if (updateDeductionHistory.message) { return req.error(updateDeductionHistory) }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "postDeducations", constants.LOG_UPDATE_HISTORY_DB);
            let insertComments = await dbData.insertComments(uploadId, updatedOn, userId, comments, req);
            if (insertComments.message) { return req.error(insertComments) }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "postDeducations", constants.LOG_INSERT_COMMENT_DB);
            config.response.body = {
                sMessage: constants.LOG_UPDATE_MSG, uploadId
            }
            let resultData = {
                data: config.response
            }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "postDeducations", constants.LOG_UPDATE_RESPONSE);
            return resultData;
        }
        catch (err) {
            logger.getErrorLogger(`${LG_SERVICE}${__filename}`, "postDeducations", errConstants.LOG_UPDATE_ERR, err);
            config.errResponse.statusCode = err.statusCode || 500;
            config.errResponse.body = err.message || errConstants.LOG_UPDATE_DOC_ERROR;
            return req.error(config.errResponse);
        }
    });

    /**
     * Function to Edit Deduction into HANA DB based on input Details
     */

    this.on('updateDeduction', async (req) => {
        try {
            let dt = datetime.create();
            let dataToUpload = req.data.payload || null;
            let sComments = req.data.comments || null;
            let uploadId = req.data.uploadID || null;
            let sUploadedBy = req.data.uploadedBy || null;
            let updatedOn = dt.format('Y/m/d H:M:S').toString();
            logger.getLogger(`${LG_SERVICE}${__filename}`, "updateDeduction", constants.LOG_INITIAL_COMMENT);
            let deleteUploads = await dbData.deleteDeductionUploads(req, uploadId);
            if (deleteUploads.message) { return req.error(deleteUploads) }
            for (let i in dataToUpload) {
                let row = dataToUpload[i];
                if (row.Personnel_Number) {
                    let insertDeductionResults = await dbData.insertDeductionUploads(uploadId, row, req);
                    if (insertDeductionResults.message) { return req.error(insertDeductionResults) }
                }
            }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "updateDeduction", constants.LOG_UPDATE_DEDUCTION_DB);
            let updateStatus = await dbData.updateDeductionHistory(req, uploadId, updatedOn, sUploadedBy, constants.INITIAL_STATUS);
            if (updateStatus.message) { return req.error(updateStatus) }
            let insertComments = await dbData.insertComments(uploadId, updatedOn, sUploadedBy, sComments, req);
            if (insertComments.message) { return req.error(insertComments) }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "updateDeduction", constants.LOG_INSERT_COMMENT_DB);
            config.response.body = {
                sMessage: constants.LOG_UPDATE_MSG, uploadId
            }
            let resultData = {
                data: config.response
            }
            logger.getLogger(`${LG_SERVICE}${__filename}`, "updateDeduction", constants.LOG_UPDATE_RESPONSE);
            return resultData;
        }
        catch (err) {
            logger.getErrorLogger(`${LG_SERVICE}${__filename}`, "updateDeduction", errConstants.LOG_UPDATE_ERR, err);
            config.errResponse.statusCode = err.statusCode || 500;
            config.errResponse.body = {
                message: err.message || errConstants.LOG_UPDATE_DOC_ERROR
            }
            let resultData = {
                data: config.errResponse
            }
            return req.error(resultData);
        }
    });

    this.on('Ytest', async (req) => {
        try {
            let GetResult = await cds.tx(req).run(SELECT.from(Yamaha, ['BTPID', 'BusinessID','ADMIN'])
                .where({ BTPID: req.data.btpID }));
            if (GetResult[0]) {
                return req.error ("BTPID already Present");
            }
            else {
                console.log("res::" + JSON.stringify(GetResult));
                let InsertResult = await cds.tx(req).run(INSERT.into(Yamaha).entries(
                    {
                        BTPID: req.data.btpID,
                        BusinessID: 128,
                        ADMIN: req.data.admin || false
                    }
                ));
                console.log("result:" + InsertResult)
                let resultData = {
                    data: "Data Inserted"
                }
                return resultData;
            }
        }
        catch (e) {
            console.log(e);
            return e;
        }
    });

    this.on('Selecttest', async (req) => {
        try {
            let GetResult = await cds.tx(req).run(SELECT.from(Yamaha, ['BTPID', 'BusinessID'])
                .where({ BusinessID: 128 }));
            console.log("result:" + GetResult)
            let resultData = {
                data: GetResult
            }
            return resultData;
        }
        catch (e) {
            console.log(e);
            return e;
        }
    });

    this.on('DeleteUser', async (req) => {
        try {
            let deletedResult = await cds.tx(req).run(DELETE(Yamaha).where({ BTPID: "aaa231" }));
            console.log("result:" + deletedResult)
            let resultData = {
                data: "BTP ID deleted"
            }
            return resultData;
        }
        catch (e) {
            console.log(e);
            return e;
        }
    });
    
    this.on('getUserInfo', req => {
        try {
            let results = {};
            results.user = req.user.id;
            if (req.user.hasOwnProperty('locale')) {
                results.locale = req.user.locale;
            }
            //results.roles = {};
            // results.roles.identified = req.user.is('identified-user');
            // results.roles.authenticated = req.user.is('authenticated-user');
            // results.roles.Viewer = req.user.is('CIO_Viewer');
            // results.roles.Admin = req.user.is('CIO_Admin');
            config.response.body = {
                sMessage:"getting user info", results
            }
            let resultData = {
                data: config.response
            }
            return resultData;
        } catch (e) {
            console.log(e)
        }

    })
});

