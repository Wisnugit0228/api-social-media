import { nanoid } from "nanoid";
import Coments from "../models/comentModel.js";
class ComentService {
  constructor() {
    this._Coment = Coments;
  }

  async addComent(postId, userId, content) {
    const created_at = new Date().toISOString();
    const id = `coment-${nanoid(16)}`;
    const result = await this._Coment.create({
      _id: id,
      post_id: postId,
      user_id: userId,
      content,
      created_at,
    });
    if (!result) {
      throw new Error("Coment gagal ditambah");
    }
    return {
      user_id: result.user_id,
      content: result.content,
      created_at: result.created_at,
    };
  }
}

export default ComentService;
