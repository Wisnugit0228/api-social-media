import { nanoid } from "nanoid";
import Posts from "../models/postModel.js";
import Users from "../models/usersModel.js";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";

class PostsService {
  constructor() {
    this._Post = Posts;
    this._User = Users;
  }

  async uploadImage(image) {
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const key = `content/${uuidv4()}-${image.originalname}`;
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: image.buffer,
      ContentType: image.mimetype,
    };

    return s3.upload(params).promise();
  }

  async addPost(userId, { content, image, tags }) {
    const id = `post-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    let media_url = null;
    let media_key = null;
    if (image) {
      const media = await this.uploadImage(image);
      media_url = media.Location;
      media_key = media.Key;
    }
    const newPost = await this._Post.create({
      _id: id,
      user_id: userId,
      content,
      media_url,
      media_key,
      tags,
      created_at,
      likes: [],
    });
    if (!newPost) {
      throw new Error("gagal uploaad post");
    }
    return newPost;
  }

  async addLike(postId, { userId }) {
    const findPost = await this._Post.findById(postId);
    if (!findPost) {
      throw new Error("Postingan tidak ditemukan");
    }
    const userLiked = await this._User.findById(userId);
    const usernameLike = userLiked.username;
    const newLike = await this._Post.findByIdAndUpdate(
      postId,
      {
        $addToSet: { likes: usernameLike },
      },
      { new: true }
    );
    return {
      total_like: newLike.likes.length,
    };
  }
}

export default PostsService;
