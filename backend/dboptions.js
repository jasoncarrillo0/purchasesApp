const { Router }         = require('express');
const { Purchase }       = require('../../mongoose/schemas');
const dboptionsRouter    = Router();
const to                 = require('await-to-js').default;
const { failedDbOptionsLookup, failedDbOptionsRoute, failedAppVersionsLookup }  = require('../../utils/errors')

// for /dboptions route
dboptionsRouter.route('/')
.get(async (req, res) => {
    try {
        // get appNames and dates first
        let findConfig = {};
        // front end will send a query for test purchases only
        if (req.query) {
            if (req.query.testPurchases === true) {
                findConfig.testTransaction = true;
            }
        }
        
        const [e1, data] = await to(
            Purchase
            .find(findConfig)
            .lean()
            .select('appName date deviceBrand -_id')
            .sort({'date': -1})
            .exec()
        );


        if (e1) return res.send(failedDbOptionsLookup(e1));
        const recentYear = new Date(data[0].date).getFullYear().toString();
        const oldestYear = new Date(data[data.length - 1].date).getFullYear().toString();
        const brands     = [...new Set(data.map(d => d.deviceBrand).filter(d => d))];
        const appNames   = [...new Set(data.map(d => d.appName).filter(d => d))];
        
        let appVersionsData = {};
        for (let i = 0; i < appNames.length; i++) {
            const [e2, appVersions] = await to(
                Purchase
                .find({appName: appNames[i]})
                .lean()
                .select('appVersion -_id')
                .sort({appName: -1})
                .exec()
            );
            if (e2) return res.send(failedAppVersionsLookup(e2))
            appVersionsData[appNames[i]] = [...new Set(appVersions.map(d => d.appVersion))]
        }
        return res.send({ appNames, recentYear, oldestYear, appVersionsData, brands }); 
    } catch (e) {
        return res.send(failedDbOptionsRoute(e.message))
    }
    
});

module.exports = { dboptionsRouter };