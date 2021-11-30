namespace app.deductions;

// using { Currency, managed, sap } from '@sap/cds/common';

// using { Currency } from '@sap/cds/common';

entity Deductions_Upload { //(mulitple)-Books

    key personnelNumber     : Integer;
        wageType            : Integer;
        wageTypeDescription : String(140);
        amount              : Integer;

        // currency : Currency;

        currency            : String(40);
        wbs                 : String(40);
        uploadID            : Association to Deductions_History; //foregin key

}


entity Deductions_History { //single-authors

    key uploadID         : UUID; //unique id

        status           : String(40); //awaiting approval/approved/rejected/successfully uploloaded

        uploadedOn       : DateTime;
        uploadedBy       : String(40);

        deductionsUpload : Association to many Deductions_Upload
                               on deductionsUpload.uploadID = $self;

}
