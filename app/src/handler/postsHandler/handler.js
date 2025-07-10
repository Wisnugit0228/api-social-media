import PostsService from "../../services/postsService.js";
import postsValidator from "../../validator/postsValidator/index.js";

const postsService = new PostsService();

export const postPostsHandler = async (req, res) => {
  try {
    postsValidator.postsValidate(req.body);
    const image = req.file;
    const userId = req.userId;
    const { content, tags } = req.body;
    const newPost = await postsService.addPost(userId, { content, image, tags });
    res.status(201).json({
      status: "success",
      data: newPost,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const addLikeHandler = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;
    const newLike = await postsService.addLike(postId, { userId });
    res.status(200).json({
      status: "success",
      data: newLike,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
