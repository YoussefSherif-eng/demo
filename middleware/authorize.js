const conn = require("../db/dbConnention");
const util = require("util");

const authorize = async (req, res ,next)=>{

    const query = util.promisify(conn.query).bind(conn);
    const {token} = req.headers;
    const user = await query("select * from users where token = ?" ,[token])
    if(user[0 ]&& user[0].role == "0"){
        res.locals.user = user[0]
        next();
    } else{
        res.status(403).json({
            msg:"you are not cont"
    })
    }

}

module.exports = authorize;