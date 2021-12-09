const Papa        = require('papaparse')
const { Install } = require('../schemas');
module.exports = {
    // runs every morning at 12:01 AM, gets yesterday's total installs and ads to DB
    updateInstalls: async () => {
        const today     = new Date()
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        

        // get data
        const dateForQuery      = yesterday.toLocaleDateString('en-CA');
        const reqString         = APPS_FLYER_URL + process.env.APPS_FLYER_KEY + `&from=${dateForQuery}&to=${dateForQuery}&maximum_rows=1000000`;
        const [error, response] = await to(axios.get(reqString));
        if (error) {
            throw new Error(error.message)
        }


        // save data in DB
        const data = await readCSV(response.data);
        const [mongoErr1, installCountBefore] = await to(Install.countDocuments({}).exec());
        if (mongoErr1) throw new Error(mongoErr1.message);
        for (let install of data) {
            const newInstall = new Install(install);
            await newInstall.save();
        }


        const [mongoErr2, installCountAfter] = await to(Install.countDocuments({}).exec());
        if (mongoErr2) {
            // log here
            logInstallUpdate(installCountBefore, data.length, 'added installs, but error in querying count', mongoErr2);
            throw new Error(mongoErr2.message);        
        }
        logInstallUpdate(installCountBefore, data.length, installCountAfter);
    },

    getInstallCosts: async (fromDate, toDate, chosenApps) => {
        let matchField = { 
            $match: {
                "Install Time": { $gte: fromDate, $lte: toDate}
            }
        };

        if (chosenApps.length > 0) {
            let regexArr = [];
            chosenApps.forEach(name => {
                regexArr.push(new RegExp(name))
            });
            matchField["$match"]["App Name"] = { $in: regexArr };
        }
        const wholeQuery = [matchField,
            { 
                $addFields: { 
                    siteId : "$Site ID" , 
                    costValue: {$toDecimal: "$Cost Value"} 
                } 
            },
            {
                $group: {
                    _id: { siteId: "$siteId" },
                    totalAmount: { $sum: "$costValue" },
                    totalInstalls: {$sum: 1},
                    campaigns: {
                        $push: "$campaign"
                    }
                }
            },
            { 
                $addFields: {siteId: "$_id.siteId"}
            },
            { 
                $project: {_id: 0, totalAmount: {$toDouble: "$totalAmount"}, siteId: "$siteId", totalInstalls: "$totalInstalls"}
            }
        ];

        //console.log(util.inspect(wholeQuery, false, null, true))
        const [e, res] = await to(
            Install
            .aggregate(wholeQuery)
            .exec()
        );
        if (e) throw new Error(e.message);
        return res
    }
}

async function readCSV(csvData) {
    return new Promise(resolve => {
        Papa.parse(csvData, {
            header: true,
            complete: results => {
                log('\nComplete', results.data.length, 'records.'); 
                resolve(results.data);
            }
        });
    });
}