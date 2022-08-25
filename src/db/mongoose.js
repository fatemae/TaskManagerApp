const mongoose = require("mongoose");
// const validator = require("validator");
const connectionURL = process.env.MONGODB_CONNECTION_URL;
const databaseName = process.env.MONGODB_DATBASENAME;


mongoose.connect(connectionURL+"/"+databaseName, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

// const me= new User({name: "Alex", email: "alex@sd.om", password: "passwordvsdc", age:30});

// me.save().then((res)=>{
//     console.log(me);
// }).catch(err => {
//     console.log(err);
// });



// const task1 = new Task({});

// task1.save().then(res => {
//     console.log(task1);
// }).catch(err => {
//     console.log(err);
// });