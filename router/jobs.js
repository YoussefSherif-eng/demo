const router = require("express").Router();
const conn = require("../db/dbConnention");
const authorize = require("../middleware/authorize")
const employers = require("../middleware/employers")
const { body, validationResult } = require('express-validator');
const upload = require("../middleware/uploadImage");
const util = require("util");
const fs = require("fs");
const admin = require("../middleware/admin");


// super Admin


        //Update Employer
router.put(
    "/updateEmployer/:id",
    admin,
    body("name").isString().withMessage("please enter a valid job name"),
    body("email").isString().withMessage("please enter a valid description "),
    async (req, res) => {
        try {
            // 1- VALIDATION REQUEST [manual, express validation] 
            const query = util.promisify(conn.query).bind(conn);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            // 2- CHECK IF MOVIE EXISTS OR NOT
            const employer = await query("select * from users where id = ?", [
                req.params.id,
            ]);
            if (!employer[0]) {
                res.status(404).json({ ms: "jobs not found !" });
            }

            // 3- PREPARE MOVIE OBJECT
            const employerObj = {
                name: req.body.name,
                email: req.body.email, 
            };

            // 4- UPDATE MOVIE
            await query("update users set ? where id = ?", [employerObj, employer[0].id]);

            res.status(200).json({
                msg: "jobs updated successfully",
            });
        } catch (err) {
            res.status(500).json(err);
        }
    }
    ); 

        //Delete Employer
router.delete(
    "/deleteEmployer/:id",
    admin,
    async (req, res) => {

        const query = util.promisify(conn.query).bind(conn);

        const employers = await query("select * from users where id = ?", [req.params.id])

        if (!employers[0]) {
            res.json("no hi")
        }

        await query("delete from users where id= ? ", [employers[0].id])

        res.status(200).json({
            message: "Done"
        })


    })

        //Get All Employer
router.get(

    "/employers", admin, async (req, res) => {

        const query = util.promisify(conn.query).bind(conn);

        const employers = await query(`select * from users  where role = 1`)
        
        res.status(200).json(employers)
    })

        //Select One Employer
router.get(
    "/employers/all/:id", admin, async (req, res) => {

        const query = util.promisify(conn.query).bind(conn);
        const movie = await query("select * from users  where id = ? and role = 1", [req.params.id])

        if (!movie[0]) {
            res.json("no hi")
        }
        res.status(200).json(movie[0])
    })

        //Acception of request job
router.put(
    '/jobAccept/:proposalId/accept', 
    async (req, res) => {
        const { proposalId } = req.params;
        const query = util.promisify(conn.query).bind(conn);

        try {
            // Update proposal status to rejected in the database
            const result = await query(
                'UPDATE jobs SET status = ? WHERE id = ? AND status = ?',
                ['accepted', proposalId, 'pending']    
            ); 

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Proposal not found or already accepted' });
            }

            return res.status(200).json({ message: 'Proposal accepted successfully' });
        } catch (error) {
            console.error('Error accepting proposal:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

        //Rejection of request job
router.put(
    '/jobReject/:proposalId/reject', 
    async (req, res) => {
        const { proposalId } = req.params;
        const query = util.promisify(conn.query).bind(conn);

        try {
            // Update proposal status to rejected in the database
            const result = await query(
                'UPDATE jobs SET status = ? WHERE id = ? AND status = ?',
                ['rejected', proposalId, 'pending']
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Proposal not found or already rejected' });
            }

            return res.status(200).json({ message: 'Proposal rejected successfully' });
        } catch (error) {
            console.error('Error rejecting proposal:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });


//Employers


        //Create Job
router.post(
    "/create",
    employers,
    body("name").isString().withMessage("please enter a valid job name"),
    body("employer_name "),
    body("job_type "),
    body("post_creation_date "),
    body("description").isString().isString().withMessage("please enter a valid description "),
    body("salary"),
    async (req, res) => {
        try {
            const errors = validationResult(req); 
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }


            const movie = {
                employer_id: res.locals.admin.id,
                name: req.body.name,
                employer_name: req.body.employer_name,
                job_type: req.body.job_type,
                post_creation_date: req.body.post_creation_date, 
                description: req.body.description,
                salary: req.body.salary,
            };

            const query = util.promisify(conn.query).bind(conn);
            await query("insert into jobs set ? ", movie);
            res.status(200).json({
                msg: "job created successfully !",
            });
        } catch (err) {
            res.status(500).json(err);
        }
    }
    );

        //Update Job
router.put(
    "/update/:id",
    employers,
    body("name").isString().withMessage("please enter a valid job name"),
    body("employer_name "),
    body("job_type "),
    body("post_creation_date "),
    body("description").isString().withMessage("please enter a valid description "),
    body("salary"),
    async (req, res) => {
        try {
            // 1- VALIDATION REQUEST [manual, express validation]
            const query = util.promisify(conn.query).bind(conn);
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            } 

            // 2- CHECK IF MOVIE EXISTS OR NOT
            const movie = await query("select * from jobs where id = ?", [
                req.params.id,
            ]);
            if (!movie[0]) {
                res.status(404).json({ ms: "jobs not found !" });
            }

            // 3- PREPARE MOVIE OBJECT
            const movieObj = {
                name: req.body.name,
                employer_name: req.body.employer_name,
                job_type: req.body.job_type,
                post_creation_date: req.body.post_creation_date,
                description: req.body.description,
                salary: req.body.salary,
            };

            // 4- UPDATE MOVIE
            await query("update jobs set ? where id = ?", [movieObj, movie[0].id]);

            res.status(200).json({
                msg: "jobs updated successfully",
            });
        } catch (err) {
            res.status(500).json(err);
        }
    }
    );

        //Delete Job
router.delete(
    "/delete/:id",
    employers,
    async (req, res) => {

        const query = util.promisify(conn.query).bind(conn);

        const movie = await query("select * from jobs where id = ?", [req.params.id])

        if (!movie[0]) {
            res.json("no hi")
        }

        await query("delete from jobs where id= ? ", [movie[0].id])

        res.status(200).json({
            message: "Done"
        })



    })

        //Select all jobs for the same employer
router.get(

    "/jobE/:employerId", employers, async (req, res) => {

        const employerId = req.params.employerId;

        const query = util.promisify(conn.query).bind(conn);


        const works = await query('SELECT * FROM jobs WHERE employer_id = ?', [employerId]);
        
        res.status(200).json(works)
    })

        //Select all applications for the same employer
router.get(
            "/applyShow/:employer_id", employers, async (req, res) => {
                try {
                    const employer_id = req.params.employer_id;
                    const query = util.promisify(conn.query).bind(conn);
                    const works = await query('SELECT * FROM apply WHERE employer_id = ?', [employer_id]);
                    
                    // Map over the works and append the file paths of CVs to each job application
                    const worksWithCVPaths = await Promise.all(works.map(async (work) => {
                        // Assuming `cv` is the column name in your database table storing the CV file paths
                        work.cv = "http://" + req.hostname + ":4000/" + work.cv;
                        return work;
                    }));
                    res.status(200).json(worksWithCVPaths);
                } catch (error) {
                    console.error("Error fetching job applications:", error);
                    res.status(500).json({ error: "Internal Server Error" });
                } 
            }
        );
        

        //Acception of the application
router.put(
'/proposals/:proposalId/accept', 
async (req, res) => {
    const { proposalId } = req.params;
    const query = util.promisify(conn.query).bind(conn);

    try {
        // Update proposal status to rejected in the database
        const result = await query(
            'UPDATE apply SET status = ? WHERE id = ? AND status = ?',
            ['accepted', proposalId, 'pending']
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Proposal not found or already accepted' });
        }

        return res.status(200).json({ message: 'Proposal accepted successfully' });
    } catch (error) {
        console.error('Error accepting proposal:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
    });

        //Rejection of the application
router.put(
    '/proposals/:proposalId/reject',
    async (req, res) => {
        const { proposalId } = req.params;
        const query = util.promisify(conn.query).bind(conn);

        try {
            // Update proposal status to rejected in the database
            const result = await query(
                'UPDATE apply SET status = ? WHERE id = ? AND status = ?',
                ['rejected', proposalId, 'pending']
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Proposal not found or already rejected' });
            }

            return res.status(200).json({ message: 'Proposal rejected successfully' });
        } catch (error) {
            console.error('Error rejecting proposal:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });

        //Cancel Request
router.delete(
    "/deleteRequest/:id",
    async (req, res) => {

        const query = util.promisify(conn.query).bind(conn);

        const movie = await query("select * from jobs where id = ?", [req.params.id])

        if (!movie[0]) {
            res.json("no hi")
        }

        await query("delete from jobs where id= ? ", [movie[0].id])

        res.status(200).json({
            message: "Done"
        })
    })

        //Remove Job From List
router.put(
        '/removeJobFromList/:Id', 
        async (req, res) => {
            const { Id } = req.params;
            const query = util.promisify(conn.query).bind(conn);
        
            try {
                // Update proposal status to rejected in the database
                const result = await query(
                    'UPDATE jobs SET statuAccept = ? WHERE id = ? ',
                    ['Accept', Id ]
                );
        
                if (result.affectedRows === 0) { 
                    return res.status(404).json({ error: 'Proposal not found or already accepted' });
                }
        
                return res.status(200).json({ message: 'Proposal accepted successfully' });
            } catch (error) {
                console.error('Error accepting proposal:', error);
                return res.status(500).json({ error: 'Internal server error' });
            }
    });


// user


        //Get All Job 
router.get(

    "", async (req, res) => {

        const query = util.promisify(conn.query).bind(conn);
        let search = ""
        if (req.query.search) {
            search = `where name LIKE '%${req.query.search}%' or description LIKE '%${req.query.search}%' or job_type LIKE '%${req.query.search}%' or salary LIKE '%${req.query.search}%' `
        }
        const movies = await query(`select * from jobs ${search}`)
        
        res.status(200).json(movies)
    })
 
        //Select One Job
router.get(  
    "/Job/Details/:id", async (req, res) => { 

        const query = util.promisify(conn.query).bind(conn);
        const movie = await query("select * from jobs where id = ?", [req.params.id])

        if (!movie[0]) {
            res.json("no hi") 
        }
        movie[0].apply = await query("select * from apply where job_id = ?", movie[0].id)
        res.status(200).json(movie[0])
    }) 

        //Select all applications for the same User
router.get(

    "/userApply/:userId", authorize, async (req, res) => {

        const userId = req.params.userId;

        const query = util.promisify(conn.query).bind(conn);


        const works = await query('SELECT * FROM apply WHERE user_id = ?', [userId]);

        res.status(200).json(works)
    })

        //Post Application Job
router.post(
    '/applyers',
    upload.single("cv"),
    body("job_id").isNumeric().withMessage("please enter  a valid id"),
    body("employer_id").isNumeric().withMessage("please enter  a valid id"),
    body("name").isString().withMessage("please enter  a valid review"),
    body("email").isEmail(),
    body("phone"),
    body("age"),
    authorize,
    async (req, res) => {
        const query = util.promisify(conn.query).bind(conn);


        if (!req.file) {
            return res.status(400).json({
                errors: [
                {
                    msg: "Image is Required",
                },
                ],
            });
            }
        // Check if the user has already applied for the job
        const movie = await query("select * from jobs where id = ?", [req.body.job_id])
        const employer = await query("select * from users where id = ?", [req.body.employer_id])
        const RO = {
            user_id: res.locals.user.id,
            job_id: movie[0].id,
            employer_id: employer[0].id,
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            age: req.body.age,  
            cv: req.file.filename,
        }
        const existingApplication = await query('SELECT * FROM apply WHERE job_id = ? AND user_id = ?', [RO.job_id, RO.user_id]);

        if (existingApplication.length > 0) {
            return res.status(400).json({ error: 'You have already applied for this job.' });
        }

        // If no existing application, proceed with the new application submission
        // Insert the new application into the database
        await query('INSERT INTO apply set ?', RO);

        // Send a success response
        return res.status(200).json({ message: 'Application submitted successfully.' });
    });

        //Cancel Application
router.delete(
    "/deleteApply/:id",
    async (req, res) => {

        const query = util.promisify(conn.query).bind(conn);

        const movie = await query("select * from apply where id = ?", [req.params.id])

        if (!movie[0]) {
            res.json("no hi")
        }

        await query("delete from apply where id= ? ", [movie[0].id])

        res.status(200).json({
            message: "Done"
        })
    })

        //Save Important Job
router.post(
    '/saveImportant/:jobId', body("userId"), async (req, res) => { 
        const jobId = req.params.jobId;
    
        try {
            const query = util.promisify(conn.query).bind(conn);
            await query('INSERT INTO saved_jobs (user_id, job_id) VALUES (?, ?)', [req.body.userId, jobId]);
            res.status(200).json({ message: 'Job saved successfully.' }); 
        } catch (error) {
            console.error('Error saving job:', error);
            res.status(500).json({ error: 'Internal server error.' });  
        }
    });

        //Get Important Job
router.get(
    '/save/Important', async (req, res) => {
        const userId = req.query.userId;
    
        try {
            const query = util.promisify(conn.query).bind(conn);
            const savedJobs = await query('SELECT * FROM saved_jobs WHERE user_id = ?', [userId]);
            res.status(200).json(savedJobs);
        } catch (error) {
            console.error('Error retrieving saved jobs:', error);
            res.status(500).json({ error: 'Internal server error.' });
        }
    });

        //Delete Important Job
router.delete(
        "/deleteSave/:id",
        async (req, res) => {
    
            const query = util.promisify(conn.query).bind(conn);
    
            const movie = await query("select * from  saved_jobs where id = ?", [req.params.id])
    
            if (!movie[0]) {
                res.json("no hi")
            }
    
            await query("delete from  saved_jobs where id= ? ", [movie[0].id])
    
            res.status(200).json({
                message: "Done"
            })
    })

        //Get Accepted application
router.get(
            "/applyShowUser/:id", async (req, res) => {
                try {
                    const query = util.promisify(conn.query).bind(conn);
                    const works = await query('SELECT * FROM apply WHERE user_id = ?', [req.params.id]);
                    res.status(200).json(works);
                } catch (error) {
                    console.error('Error retrieving user applications:', error);
                    res.status(500).json({ error: 'Internal server error.' });
                }
    });


module.exports = router;    