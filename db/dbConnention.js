const mySql = require("mysql");

const connection = mySql.createConnection({
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'job connect',
    port            :"3306"
});

connection.connect((err)=>{
    if(err) {
        console.error("error connect");
        return;
    }
    console.log('connected to mySql');
});

module.exports =connection;