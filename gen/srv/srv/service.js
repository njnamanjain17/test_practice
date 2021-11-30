const cds = require('@sap/cds');
const datetime = require('node-datetime');
const { Deductions_Upload } = cds.entities('app.deductions');
const { Deductions_History } = cds.entities('app.deductions');
module.exports = cds.service.impl(function () {
    let HistoryResult;
    let insertingUID;
    var dt = datetime.create();
    var uploadedOn = dt.format('Y/m/d H:M:S').toString();
    console.log("uploadedOn:"+uploadedOn)
    this.on('sendDataToUpload', async (req) => {
        console.log("req" + req);
        const tx = cds.transaction(req);
         HistoryResult = await cds.tx(req).run(INSERT.into(Deductions_History).entries(
            {
                status: 'awaiting approval',
                uploadedOn: uploadedOn,
                uploadedBy: 'xyz@accenture.com'
            }
        ));
        console.log("result::" + HistoryResult);
        insertingUID =HistoryResult.results[0].values[3]
        console.log("insertingUID:"+insertingUID)
        let uploadResult = await cds.tx(req).run(INSERT.into(Deductions_Upload).entries(
            {
                personnelNumber: 31022356,
                wageType: 1208,
                wageTypeDescription: 'Referral Bonus',
                amount: 720,
                CURRENCY_CODE: "PHP",
                wbs: 'BWPSY001',
                UPLOADID_UPLOADID: insertingUID
            }
        ));
        console.log("uploadResult:"+uploadResult)

        return "suceess";
    });
   console.log(HistoryResult)
    this.on('retriveUploadID', async (req) => {
        const tx = cds.transaction(req)
        // var a = await tx.run(SELECT.from(Deductions_History, ['uploadID'])
        //     .where({ uploadedBy: 'punam@accenture.com' }))
        // console.log("a::::" + a)
        // let id = a[0].uploadID;
        // console.log("id::" + id)
        // let uploadResult = await cds.tx(req).run(INSERT.into(Deductions_Upload).entries(
        //     {
        //         personnelNumber: 667922356,
        //         wageType: 1296,
        //         wageTypeDescription: 'Referral Bonus',
        //         amount: 720,
        //         CURRENCY_CODE: "PHP",
        //         wbs: 'BWPSY001',
        //         UPLOADID_UPLOADID: insertingUID
        //     }
        // ));
        // console.log("uploadResult:"+uploadResult)


        return "sucessful retrive as well insert"
    })

    // console.log("id outside function:"+id)
    //return "Successful";
    console.log("outside insert fun");
})

