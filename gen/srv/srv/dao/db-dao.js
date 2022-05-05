const constants = require("../util/constant-util.js");
const errConstants = require("../util/errorcodes-constants.js");
const logger = require('../util/logger.js');
const LG_DB = 'DB: ';
const cds = require('@sap/cds');
const { Deductions_Upload, Deductions_History, Approver_Comments } = cds.entities('app.deductions');

/**
 * Function to generate upload ID
 * Function Invoked in - sendDataToUpload()
 */
async function createUploadId() {
    try {
        const db = await cds.connect.to("db");
        let sequence_ID = await db.run(`SELECT "db.src.UPLOAD_ID".NEXTVAL as Sequence_number FROM DUMMY`);
        return sequence_ID[0].SEQUENCE_NUMBER;
    } catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "createUploadId", errConstants.LOG_SELECT_ERR, err);
        return err;
    }
}

/**
 * Function to insert History Details into HANA DB
 * Function Invoked in - sendDataToUpload()
 * @param {Integer} uploadId 
 * @param {Date} uploadedOn 
 * @param {String} sUploadedBy 
 * @param {string} deductionsUploadType 
 * @param {Object} req 
 */
async function insertHistory(uploadId, uploadedOn, sUploadedBy, deductionsUploadType, req) {
    try {
        let HistoryResult = await cds.tx(req).run(INSERT.into(Deductions_History).entries(
            {
                uploadID: uploadId,
                status: constants.INITIAL_STATUS,
                uploadedOn: uploadedOn,
                uploadedBy: sUploadedBy,
                deductionsUploadType: deductionsUploadType
            }
        ));
        return HistoryResult;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "insertHistory", errConstants.LOG_INSERT_ERR, err);
        return err;
    }
}

/**
 * Function to insert Comments into HANA DB
 * Function Invoked in - sendDataToUpload()
 * @param {Integer} uploadId 
 * @param {Date} updatedOn 
 * @param {String} userId 
 * @param {String} comments 
 * @param {Object} req 
 */
async function insertComments(uploadId, updatedOn, userId, comments, req) {
    try {
        let insertComment = await cds.tx(req).run(INSERT.into(Approver_Comments).entries(
            {
                uploadID: uploadId,
                commentDate: updatedOn,
                userID: userId,
                comments: comments
            }
        ));
        return insertComment;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "insertComments", errConstants.LOG_INSERT_ERR, err);
        return err;
    }
}

/**
 * Function to insert Deductions details into HANA DB
 * Function Invoked in - sendDataToUpload()
 * @param {Integer} seqIDValue 
 * @param {Array} row 
 * @param {Object} req 
 */
async function insertDeductionUploads(seqIDValue, row, req) {
    try {
        let uploadResult = await cds.tx(req).run(INSERT.into(Deductions_Upload).entries(
            {
                personnelNumber: row.Personnel_Number,
                wageType: row.Wage_Type,
                wageTypeDescription: row.Wagetype_Description,
                amount: row.Amount,
                CURRENCY: row.Currency,
                wbs: row.WBS,
                UPLOADID_UPLOADID: seqIDValue
            }
        ));
        return uploadResult;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "insertDeductionUploads", errConstants.LOG_INSERT_ERR, err);
        return err;
    }
}

/**
 * Function to GET Deductions details from HANA DB
 * Function Invoked in - retriveUploadID()
 * @param {Object} req 
 */
async function getDeductionUploads(req) {
    try {
        let iUploadedID = req.data.uploadID || null;
        let deductionUpload = await cds.tx(req).run(SELECT.from(Deductions_Upload, ['personnelNumber', 'wageType',
            'wageTypeDescription', 'amount', 'CURRENCY', 'wbs'])
            .where({ UPLOADID_UPLOADID: iUploadedID }));
        return deductionUpload;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "getDeductionUploads", errConstants.LOG_SELECT_ERR, err);
        return err;
    }
}

/**
 * Function to GET Comments from HANA DB
 * Function Invoked in - retriveUploadID()
 * @param {Object} req 
 */
async function getComments(req) {
    try {
        let iUploadedID = req.data.uploadID || null;
        let commentsResult = await cds.tx(req).run(SELECT.from(Approver_Comments, ['uploadID', 'commentDate',
            'userID', 'comments'])
            .where({ UPLOADID: iUploadedID }));
        return commentsResult;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "getComments", errConstants.LOG_SELECT_ERR, err);
        return err;
    }
}
/**
 * Function to UPDATE status and updated time in Deduction History Table
 * Function Invoked in - postDeductions() and updateDeduction()
 * @param {Object} req 
 * @param {Integer} uploadId 
 * @param {Date} updatedOn 
 * @param {String} sUploadedBy
 * @param {String} updatedStatus
 */
async function updateDeductionHistory(req, uploadId, updatedOn, sUploadedBy, updatedStatus) {
    try {
        let UpdateDeductionHistoryResult = await cds.tx(req).run(UPDATE(Deductions_History).with(
            {
                status: updatedStatus,
                uploadedOn: updatedOn,
                uploadedBy: sUploadedBy
            }
        ).where({ uploadID: uploadId }));
        return UpdateDeductionHistoryResult;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "updateDeductionHistory", errConstants.LOG_UPDATE_ERR, err);
        return err;
    }
}

/**
 * Function to UPDATE status and updated time in Deduction History Table
 * Function Invoked in - postDeductions()
 * @param {Object} req 
 * @param {String} uploadId 
 * @param {Date} updatedOn 
 * @param {String} updatedStatus 
 */
async function updateDeductionHistoryTable(req, uploadId, updatedOn, updatedStatus) {
    try {
        let UpdateDeductionHistoryResult = await cds.tx(req).run(UPDATE(Deductions_History).with(
            {
                status: updatedStatus,
                uploadedOn: updatedOn
            }
        ).where({ uploadID: uploadId }));
        return UpdateDeductionHistoryResult;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "updateDeductionHistory", errConstants.LOG_UPDATE_ERR, err);
        return err;
    }
}

/**
 * Function to GET Deduction Type from HANA DB
 * Function Invoked in - retriveUploadID()
 * @param {Object} req 
 */
async function getDeductionType(req) {
    try {
        let iUploadedID = req.data.uploadID || null;
        let deductionType = await cds.tx(req).run(SELECT.from(Deductions_History, ['deductionsUploadType'])
            .where({ UPLOADID: iUploadedID }));
        return deductionType[0].deductionsUploadType;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "getdeductionType", errConstants.LOG_SELECT_ERR, err);
        return err;
    }
}

/**
 * Function to Delete Deductions from HANA DB
 * Function Invoked in - updateDeduction()
 * @param {Object} req 
 * @param {String} uploadId
 */
async function deleteDeductionUploads(req, uploadId) {
    try {
        let removeDeductionResult = await cds.tx(req).run(DELETE(Deductions_Upload).where({ UPLOADID_UPLOADID: uploadId }));
        return removeDeductionResult;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "updateUploadDeduction", errConstants.LOG_UPDATE_ERR, err);
        return err;
    }
}
/**
 * Function to Update DeductionType from HANA DB
 * Function Invoked in - retriveUploadID()
 * @param {Object} req 
 * @param {String} deductionType
 */
async function updateDeductionType(req, deductionType) {
    try {
        let iUploadedID = req.data.uploadID || null;
        let updateDeductionTypeResult = await cds.tx(req).run(UPDATE(Deductions_History).with(
            {
                deductionsUploadType: deductionType
            }
        ).where({ uploadID: iUploadedID }));
        return updateDeductionTypeResult;
    }
    catch (err) {
        logger.getErrorLogger(`${LG_DB}${__filename}`, "updateDeductionType", errConstants.LOG_UPDATE_ERR, err);
        return err;
    }
}
module.exports.createUploadId = createUploadId;
module.exports.insertComments = insertComments;
module.exports.insertHistory = insertHistory;
module.exports.insertDeductionUploads = insertDeductionUploads;
module.exports.getDeductionUploads = getDeductionUploads;
module.exports.getComments = getComments;
module.exports.updateDeductionHistory = updateDeductionHistory;
module.exports.getDeductionType = getDeductionType;
module.exports.deleteDeductionUploads = deleteDeductionUploads;
module.exports.updateDeductionHistoryTable = updateDeductionHistoryTable;
module.exports.updateDeductionType = updateDeductionType;
