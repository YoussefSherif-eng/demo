const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("upload"));

const cors = require("cors");
app.use(cors());

const auth = require("./router/Auth");
const jobs = require("./router/jobs")

app.listen(4000 , "localhost" , ()=>{
    console.log("server is running");
});

app.use("/auth", auth);
app.use("/jobs", jobs);