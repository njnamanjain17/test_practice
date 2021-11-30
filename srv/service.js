const cds = require('@sap/cds');
const datetime = require('node-datetime');
const { Deductions_Upload } = cds.entities('app.deductions');
const { Deductions_History } = cds.entities('app.deductions');
module.exports = cds.service.impl(function () {
    let HistoryResult;
    let insertingUID;
    var dt = datetime.create();
    var uploadedOn = dt.format('Y/m/d H:M:S').toString();
    console.log("uploadedOn:" + uploadedOn)
    this.on('sendDataToUpload', async (req) => {
        console.log("req" + req);
        const tx = cds.transaction(req);
        HistoryResult = await cds.tx(req).run(INSERT.into(Deductions_History).entries(
            {
                status: 'awaiting approval',
                uploadedOn: uploadedOn,
                uploadedBy: 'spn@accenture.com'
            }
        ));
        console.log("result::" + HistoryResult);
        insertingUID = HistoryResult.results[0].values[3]
        console.log("insertingUID:" + insertingUID)
        let uploadResult = await cds.tx(req).run(INSERT.into(Deductions_Upload).entries(
            {
                personnelNumber: 71092356,
                wageType: 1208,
                wageTypeDescription: 'Referral Bonus',
                amount: 730,
                CURRENCY: "PHP",
                wbs: 'BWPSY001',
                UPLOADID_UPLOADID: insertingUID
            }
        ));
        console.log("uploadResult:" + uploadResult)

        return "suceess";
    });
    console.log(HistoryResult)
    this.on('retriveUploadID', async (req) => {
        const tx = cds.transaction(req)
        var a = await tx.run(SELECT.from(Deductions_History, ['uploadedBy', 'status'])
            .where({ uploadID: 'e8bb8196-9d06-4db8-80f3-bb8df7f5f32e' }))
        console.log("a::::" + JSON.stringify(a))
        var b = await tx.run(SELECT.from(Deductions_Upload, ['personnelNumber', 'wageType',
            'wageTypeDescription', 'amount', 'CURRENCY', 'wbs', 'UPLOADID_UPLOADID'])
            .where({ UPLOADID_UPLOADID: 'e8bb8196-9d06-4db8-80f3-bb8df7f5f32e' }));

        console.log("b::" + JSON.stringify(b))





        return "sucessful retrive as well insert"
    })

    return "Successful";
})

