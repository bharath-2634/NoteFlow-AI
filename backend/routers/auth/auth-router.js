const express = require('express');
const multer = require("multer");
const { registerUser , loginUser , googleAuth , logoutUser,authMiddleware ,getUser, updateUser} = require('../../controllers/auth/auth-controller');


const router = express.Router();
// const upload = multer({ storage: multer.memoryStorage() });
router.put("/updateUser",updateUser);
router.post('/register',registerUser);
router.post('/login',loginUser);
router.post("/google", googleAuth); 
router.post("/logout", logoutUser);
router.get("/user/:id",getUser);

router.get("/check-auth", authMiddleware, (req, res) => {
    const user = req.user;
    res.status(200).json({
      success: true,
      message: "Authenticated user!",
      user,
    });
  });

module.exports = router;