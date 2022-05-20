const cds = require('@sap/cds');
const { Yamaha } = cds.entities('my.syntest');
module.exports = cds.service.impl(async function () {
    this.on('getUserDetails', async (req) => {
        try {
            let GetResult = await cds.tx(req).run(SELECT.from(Yamaha, ['BTPID', 'BusinessID'])
                .where({ BTPID: "aaa223" }));
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
})
