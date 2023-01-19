import { USERS, SESSIONS } from "../database";
import { Request, Response } from "express";
import { signInSchema } from "../schemas";
import { v4 as uuid } from "uuid";
import bcrypt from "bcrypt";

class sessionController {
  async create(req: Request, res: Response) {
    const { error } = signInSchema.validate(req.body, { abortEarly: false });
    if (error) return res.status(422).json(error.details);
    const { email, password } = req.body;
    const user = await USERS.findOne({ email });
    if (!user) return res.sendStatus(404);
    const validation = bcrypt.compareSync(password, user.password);
    if (!validation) return res.sendStatus(401);
    const token = uuid();
    SESSIONS.insertOne({ user_id: user._id, token, time: Date.now() });
    res.send({ token });
  }
  async delete(req: Request, res: Response) {
    const token = req.get("authorization")?.replace(/\"|(Bearer )/g, "");
    if (!token) return res.sendStatus(401);
    const { deletedCount } = await SESSIONS.deleteOne({ token: token });
    if (!deletedCount) return res.sendStatus(404);
    res.sendStatus(200);
  }
}

export default new sessionController();