const express = require("express");
const router = new express.Router();
const User = require("../models/user");
const auth = require("../middleware/auth");
const multer = require("multer");
const sharp = require("sharp");
const { welcomeEmail, cancellationEmail } = require("../emails/accounts.js")

router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    welcomeEmail(user.email, user.name);

    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }

  // user.save().then(() => {
  //     res.status(201).send(user);
  // }).catch(err => {
  //     res.status(400).send(err);
  // });
});

router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter((token) => {
      return token.token !== req.token;
    });
    await req.user.save();
    res.status(200).send();
  } catch (e) {
    res.status(500).send(e);
  }
});

router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.send(500).send(e);
  }
});

router.get("/users/me", auth, (req, res) => {
  // User.find({})
  //   .then((users) => {
  //     res.send(users);
  //   })
  //   .catch((err) => {
  //     res.status(500).send(err);
  //   });
  res.send(req.user);
});

// router.get("/users/:id", auth, (req, res) => {
//   const _id = req.params.id;
//   User.findById(_id)
//     .then((user) => {
//       if (user) {
//         return res.send(user);
//       }
//       res.status(404).send();
//     })
//     .catch((err) => {
//       res.status(500).send(err);
//     });
// });

// router.patch("/users/:id", auth ,async (req, res) => {
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOper = updates.every((item) => {
    return allowedUpdates.includes(item);
  });
  if (!isValidOper) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators:true});
    // const user = await User.findById(req.params.id);
    const user = req.user;
    updates.forEach((update) => (user[update] = req.body[update]));

    await user.save();

    // if (!user) {
    //   return res.status(404).send();
    // }
    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

// router.delete("/users/:id", auth, async (req, res) => {
router.delete("/users/me", auth, async (req, res) => {
  try {
    // const user = await User.findByIdAndDelete(req.params.id);
    // if (!user) {
    //   return res.status(404).send();
    // }

    const user = await req.user.deleteOne({ email: req.user.email });
    cancellationEmail(user.email, user.name)
    // await User.remove({email: req.user.email});
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

const upload = multer({ 
  // When we remove the destination property, file will be availble in req.file
  // dest: "avatars",
  limits: {
    fileSize: 1000000
  },
  fileFilter(req, file, cb){
    if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
      return cb(new Error("Not an Image File"));
    }
    cb(undefined, true)
  }
});

router.post("/users/me/avatar" ,auth ,upload.single("avatar"), async(req, res) => {
  // req.user.avatar = req.file.buffer;
  const buffer = await sharp(req.file.buffer).resize({width: 250, height: 250}).png().toBuffer();
  req.user.avatar = buffer;
  await req.user.save();
  res.send();
}, (error, req, res, next) => {
  res.status(400).send({error: error.message});
});

router.delete("/users/me/avatar" ,auth , async(req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

router.get("/users/:id/avatar", async(req,res) => {
  try{
    const user = await User.findById(req.params.id);
    if(!user || !user.avatar){
      throw new Error("");
    }

    res.set("Content-Type", "image/png");
    res.send(user.avatar);
  }catch(e){
    res.status(404).send();
  }
});

module.exports = router;
