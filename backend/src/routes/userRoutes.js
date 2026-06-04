import express from "express"
import { createUser, deleteUser, getUsers, linkUsers, unlinkUsers, updateUser } from "../controllers/userController.js";
import { validateUser, validateFriendshipRequest } from "../middleware/validation.js";

const router = express.Router()

router.get("/", getUsers)
router.post("/", validateUser, createUser)
router.put("/:id", validateUser, updateUser)
router.delete("/:id", deleteUser)

router.post("/:id/link", validateFriendshipRequest, linkUsers)
router.delete("/:id/unlink", validateFriendshipRequest, unlinkUsers)

export default router;