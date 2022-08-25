const express = require("express");
require("./db/mongoose");
const User = require("./models/user");
const Task = require("./models/task");
const app = express();
const port = process.env.PORT;
const userRouter = require("./routers/users");
const taskRouter = require("./routers/tasks");

// MulterDemo
// const multer = require("multer");
// const upload = multer({
//     dest: 'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb){
//         console.log(file.originalname);
//         // if(!file.originalname.endsWith(".pdf")){
//         //     return cb(new Error("File must be a PDF"));
//         // }
//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             return cb(new Error("Please upload a Word Document"));
//         }
//         cb(undefined, true);

//         // cb(new Error("File must be a PDF"));
//         // cb(undefined, true);
//         // cb(undefined, false);
//     }
// });
// //The value in upload.single should match the key in body of the request
// app.post("/upload", upload.single('upload'), (req,res)=>{
//     res.send();
// }, (error, req, res, next) => {
//     res.status(400).send({error: error.message})
// })


// a middleware function that runs before route handler is run.
// When we register middleware with app.use it gets registered to all the routes
// app.use((req,res,next) => {
//     res.status(503).send("The site is under maintainence")
// });

//parse automatically incoming json
app.use(express.json());

app.use(userRouter);
app.use(taskRouter);
// const router = new express.Router()
// router.get('/test', (req,res)=>{
//     res.send("This is from another router");
// });

// app.use(router);

app.listen(port, ()=>{
    console.log("Server is up at port:"+port);
});

// const main = async() => {
    // const task = await Task.findById("63066998e3f0e14b60167e9f");  
    //populates the owner with the owner object
    // await task.populate('owner').execPopulate();
    // console.log(task.owner);
//     const user = await User.findById("63066993e3f0e14b60167e9a");
//     await user.populate("tasks").execPopulate();
//     console.log(user.tasks);
// }
// main();

