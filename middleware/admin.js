const conn = require("../db/dbConnention");
const util = require("util");

const admin = async (req, res ,next)=>{

    const query = util.promisify(conn.query).bind(conn);
    const {token} = req.headers;
    const admin = await query("select * from users where token = ?" ,[token])
    if(admin[0] && admin[0].role == "2"){
        next();
    } else{
        res.status(403).json({
            msg:"you are not cont"
    })
    }

}

module.exports = admin;