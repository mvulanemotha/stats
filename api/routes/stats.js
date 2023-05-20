const express = require('express');
const router = express.Router();
const stats = require("../modal/stats");

router.get('/today', async (req, res) => {


    let result = await stats.getTodayLogs(stats.getTime());
    res.json(result);

})

router.post('/savevisit', async (req, res) => {

    let result = await stats.savestats(req);

    if (result.affectedRows === 1) {
        res.json("SAVED");
    }

});

//avday

router.get('/avday', async (req, res) => {

    let result = await stats.dailyVisits(req);

    //console.log(result);
    res.json(result);
})

//avmonthly
router.get('/avmonthly', async (req, res) => {

    let result = await stats.monthVisits(req);

    res.json(result);

})

// av year
router.get('/avyear', async (req, res) => {


    let result = await stats.yearlyVisits();

    res.json(result);

})

// get all the logs for the month
router.get('/monthlylogs', async (req, res) => {


    let result = await stats.montlyLogs(req.query.month);
    res.json(result);

})


// insert page hits into db

router.post('/pagehit', async (req, res) => {


    // update if page already there

    let result = await stats.updatePageClick(req.body.page, req.body.date);

    //console.log(result);
    let good = 0;

    if (result.affectedRows === 1) {
        good = 1;
    }

    if (result.affectedRows === 0) {

        // check if page was not found 
        let myresponse = await stats.pageclicks(req.body.page);
        if (myresponse.affectedRows === 1) {
            good = 1;
        }
    }

    if (good === 1) {
        res.json({ message: "good" })
    } else {
        res.json({ message: "failed" })
    }


})

// get page hits 
router.get('/pagehit', async (req, res) => {

    let result = await stats.getPageHits(req.query.month, req.query.year)
    res.json(result);

})


module.exports = router;
