namespace app.deductions;

entity Deductions_Upload { //(mulitple)-Books

    personnelNumber     : Integer;
    wageType            : Integer;
    wageTypeDescription : String(140);
    amount              : Integer;
    currency            : String(40);
    wbs                 : String(40);
    uploadID            : Association to Deductions_History; //foregin key
}

entity Deductions_History { //single-authors
    key uploadID             : Integer; //unique id
        status               : String(40); //awaiting approval/approved/rejected/successfully uploloaded
        uploadedOn           : DateTime;
        uploadedBy           : String(40);
        deductionsUploadType : String(100);
        deductionsUpload     : Association to many Deductions_Upload
                                   on deductionsUpload.uploadID = $self;

}

entity Approver_Comments { //comments
    uploadID    : Integer; //unique id
    commentDate : DateTime;
    userID      : String(40);
    comments    : String(5000);
}

entity Yamaha{
     key BTPID : String(2000);
     BusinessID  : Integer; 
     ADMIN : Boolean;
}