const { query } = require("express");
const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/task");

router.post("/tasks", auth, (req,res)=>{
    // const task = new Task(req.body);
    const task = new Task({...req.body, owner: req.user._id});
    task.save().then(()=>{
        res.status(201).send(task);
    }).catch(err=>{
        res.status(400).send(err);
    })
});

// GET /tasks?completed=true
// GET /task?limit=10&skip=0
// GET /tasks?sortBy=createdAt_asc
router.get("/tasks", auth, async(req, res)=> {
    // Task.find({owner: req.user._id}).then((tasks)=>{
    //     res.send(tasks)
    // }).catch(err=>{
    //     res.status(500).send(err);
    // });
    const query = req.query;
    const match = {};
    if(query.completed){
        match.completed = query.completed==='true';   
    }
    const sort = {};
    if(query.sortBy){
        const part = query.sortBy.split('_');
        sort[part[0] ]= part[1]==='desc'?-1:1;
        console.log(sort)
    }
    try{
        await req.user.populate({
            path: 'tasks',
            match,
            options: {
                limit: parseInt(query.limit),
                skip: parseInt(query.skip),
                sort:{
                    createdAt: -1
                }
            }
        }).execPopulate();
        res.send(req.user.tasks);
    }catch(e){
        res.status(500).send(e);
    }
});

router.get("/tasks/:id", auth, async(req,res)=>{
    const _id = req.params.id;
    // Task.findById(id).then(task => {
    //     if(task){
    //         return res.send(task);
    //     }
    //     res.status(404).send();
    // }).catch(err => {
    //     res.status(500).send(err);
    // });
    try{
        const task = await Task.findOne({_id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
});

router.patch("/tasks/:id", auth, async(req,res) => {
    const allowedUpdates = ["description", "completed"];
    const updates = Object.keys(req.body);
    const isValid = updates.every(item => allowedUpdates.includes(item));
    if(!isValid){
        return res.status(400).send({error: "Invalid Updates!!"});
    }
    try{
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true});
        
        const task = await Task.findOne({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send({error: "No Task Found!"});
        }
        updates.forEach(update => task[update] = req.body[update])
        await task.save();
        
        res.send(task);
    }catch(e){
        res.status(400).send(err);
    }
});

router.delete("/tasks/:id", auth, async(req,res) => {
    try{
        const task = await Task.findOneAndDelete({_id: req.params.id, owner: req.user._id});
        if(!task){
            return res.status(404).send();
        }
        res.send(task);
    }catch(e){
        res.status(500).send(e);
    }
});

module.exports = router;
