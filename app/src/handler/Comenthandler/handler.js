import ComentService from "../../services/comentService.js";

const comentService = new ComentService();

export const postComentHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;
    const { content } = req.body;
    const newComent = await comentService.addComent(postId, userId, content);
    res.status(201).json({
      status: "success",
      data: newComent,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
