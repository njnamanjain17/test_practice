using app.deductions from '../db/schema';



service CatalogService {



    entity Deductions_Upload  as projection on deductions.Deductions_Upload;

    entity Deductions_History as projection on deductions.Deductions_History;

    function sendDataToUpload() returns String;

    function retriveUploadID() returns String;

}