const { default: axios } = require('axios');
const db = require('../../db/index');

// save page visits

let savestats = (req) => {

    try {

        let data = req.body.data;

        return new Promise((resolve, reject) => {

            let query = "insert into site_visit (ip, page , location, date) select ?,?,?,?";

            db.query(query, [data.ip, data.page, data.location, data.date], (err, result) => {

                if (err) {
                    return reject(err);
                }

                return resolve(result);

            });

        })

    } catch (error) {
        throw error;
    }

}


// get today logs

let getTodayLogs = (date = null) => {

    try {

        console.log(date)

        return new Promise((resolve, reject) => {

            var query = '';

            if (date == null) {
                query = "";
            } else {
                query = "select ip , date from site_visit where DATE(date) = CURRENT_DATE() order by date desc";
            }


            db.query(query, [date], (err, result) => {

                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });

        });

    } catch (error) {
        throw error;
    }
}





// daily visists // this can be searched acording to whatever day they want

let dailyVisits = (req) => {

    try {

        let month = req.query.month;
        let year = req.query.year;

        return new Promise((resolve, reject) => {

            let query = "select DAY(date) AS day , count(ip) as no from site_visit where MONTH(date) = ? and YEAR(date) = ? group by DAY(date)";

            db.query(query, [month, year], (err, result) => {

                if (err) {
                    return reject(err);
                }

                return resolve(result);

            });

        });

    } catch (error) {
        throw error;
    }
}

// get monthly visits

let monthVisits = (req) => {

    try {

        let year = req.query.year;

        return new Promise((resolve, reject) => {

            let query = "select MONTH(date) as month , COUNT(ip) as no from site_visit where YEAR(date) =  ? group by MONTH(date) ";
            db.query(query, [year], (err, result) => {

                if (err) {
                    return reject(err);
                }
                return resolve(result);

            })
        })
    } catch (error) {
        console.log(error);
    }

}

// viweing visits for a year

let yearlyVisits = (req) => {

    try {


        return new Promise((resolve, reject) => {

            let query = "select count(ip) as no , YEAR(date) as date from site_visit  group by YEAR(date)";

            db.query(query, (err, result) => {

                if (err) {
                    return reject(err)
                }

                return resolve(result);
            })

        })

    } catch (error) {
        throw error;
    }

}


// get logs for a month

let montlyLogs = (month) => {

    try {

        return new Promise((resolve, reject) => {

            let query = 'select * from site_visit where MONTH(date) = ?';

            db.query(query, [month], (err, result) => {

                if (err) {
                    return reject(err);
                }

                return resolve(result);
            });
        });


    } catch (error) {
        throw error
    }
}


// clicks for each page per month

let pageclicks = (page) => {

    try {

        return new Promise((resolve, reject) => {

            //let query = "insert into sitehits(pagename) select ?";

            let query = "insert into sitehits(pagename) select ? from dual where not exists (select pagename from sitehits where DATE(date) = CURRENT_DATE() and pagename = ? limit 1 )";

            db.query(query, [page, page], (err, result) => {

                if (err) {
                    return reject(err);
                }

                return resolve(result);

            });

        })

    } catch (error) {
        throw error
    }
}


// update hits for that day if page already inserted into database

let updatePageClick = (page, date) => {

    try {

        return new Promise((resolve, reject) => {

            //let query = "update sitehits set number = number + 1 where pagename = ? and DATE(?) = CURRENT_DATE()"; // DATE(date) = CURRENT_DATE()
            let query = "update sitehits set number = number + 1 where pagename = ? and MONTH(date) = MONTH(?) limit 1"

            db.query(query, [page, date], (err, result) => {

                if (err) {
                    return reject(err);
                }

                return resolve(result);

            })

        })

    } catch (error) {
        throw error;
    }

}

// get hits

let getPageHits = (month, year) => {

    try {

        return new Promise((resolve, reject) => {

            //let query = 'select * from sitehits where MONTH(date) = ? and YEAR(date) = ?';
            let query = 'select sum(number) as number , pagename from sitehits where MONTH(date) = ? and YEAR(date) = ? GROUP by pagename'

            db.query(query, [month, year], (err, result) => {

                if (err) {
                    return reject(err);
                }

                return resolve(result);
            })

        })

    } catch (error) {
        console.log(error);
    }

}

//update ip database

let getIpToUpDate = () => {

    try {

        return new Promise((resolve, reject) => {

            let query = 'select ip from site_visit where changed = 0 limit 1';

            db.query(query, (err, result) => {

                if (err) {
                    return reject(err);
                }

                return resolve(result);

            });

        })

    } catch (error) {
        throw error;
    }

}

// update ip to name 
let getlocationIP = async (ip) => {

    try {

        var name;
        var region;

        axios.get('https://ipinfo.io/' + ip + '/?token=47dbc917c0d8fcd')
            .then((response) => {

                name = response['data']['city'];
                region = response['data']['region']

            }).catch((error) => {

                //console.log(error);

            }).finally(async () => {

                if (name !== undefined) {

                    let result = await updateiptoname(ip, name, region)
                }
            })


        //console.log(name)
        //

    } catch (error) {
        console.log(error);
    }

}

// UPDATE DATABASE
let updateiptoname = async (ip, city, region) => {

    try {

        return new Promise((resolve, reject) => {

            let name = city + ' ' + region;

            let query = 'update site_visit set ip = ? ,  changed = 1 where ip = ?';
            db.query(query, [name, ip], (err, result) => {

                if (err) {
                    return reject(err);
                }
                return resolve(result);
            });

        });

    } catch (error) {
        throw error;
    }

}


setInterval(async () => {

    let data = await getIpToUpDate();

    if (data.length > 0) {
        await getlocationIP(data[0]['ip']);
    }
}, 20000);


// test the database after every minutes

let getTime = () => {

    let date_ob = new Date();

    // current date
    // adjust 0 before single digit date
    let date = ("0" + date_ob.getDate()).slice(-2);

    // current month
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

    // current year
    let year = date_ob.getFullYear();

    // current hours
    let hours = date_ob.getHours();

    // current minutes
    let minutes = date_ob.getMinutes();

    if (minutes < 10) {
        minutes = '0' + minutes
    }
    
    // current seconds
    let seconds = date_ob.getSeconds();

    if (seconds < 10) {
        seconds = '0' + seconds
    }

    // prints date & time in YYYY-MM-DD HH:MM:SS format
    return year + "-" + month + "-" + date

}


module.exports = { getTime, getIpToUpDate, updateiptoname, savestats, getTodayLogs, dailyVisits, monthVisits, yearlyVisits, montlyLogs, pageclicks, updatePageClick, getPageHits }