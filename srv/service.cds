using app.deductions from '../db/schema';
//@requires: 'authenticated-user'
service CatalogService {

    entity Deductions_Upload  as projection on deductions.Deductions_Upload;
    entity Deductions_History as projection on deductions.Deductions_History;
    entity Approver_Comments  as projection on deductions.Approver_Comments;
    entity Yamaha as projection on deductions.Yamaha;

    type uploadPayload {
        Personnel_Number     : Integer;
        Wage_Type            : Integer;
        Wagetype_Description : String;
        Amount               : String;
        Currency             : String;
        WBS                  : String;
        uploadedBy           : String;
    }

    type response {
        data : String
    };

    type responseData {
        data : array of String
    };

    function retriveUploadID(uploadID : String) returns response;
    action updateDeduction(payload : array of uploadPayload, uploadID : String, comments : String, uploadedBy : String) returns response; 
    action sendDataToUpload(uploadedBy : String, comments : String, deductionsUploadType : String, payload : array of uploadPayload) returns response; //post
    action postDeducations(uploadID : Integer, status : String, comments : String, userId: String) returns response;
    action Ytest() returns response;
    function Selecttest() returns response;
    function getUserInfo() returns response;
}
