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

  async deleteImage(key) {
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });

    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };
    return s3.deleteObject(params).promise();
  }

  async verifyPost(postId, userId) {
    const myPost = await this._Post.findById(postId);
    if (!myPost) {
      throw new Error("postingan tidak ditemukan");
    }
    const match = userId === myPost.user_id;
    if (!match) {
      throw new Error("Resourch tidak diizinkan");
    }
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
      updated_at: null,
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

  async getMyPost(userId) {
    const myPosts = await this._Post.find({ user_id: userId });
    return myPosts.map((mp) => ({
      id: mp._id,
      content: mp.content,
      media_url: mp.media_url,
      tags: mp.tags,
      total_likes: mp.likes.length,
      likes: mp.likes,
    }));
  }

  async editMyPost(postId, { userId, content, image, tags }) {
    await this.verifyPost(postId, userId);
    const updated_at = new Date().toISOString();
    const oldPost = await this._Post.findById(postId);
    let media_key = oldPost.media_key;
    let media_url = oldPost.media_url;
    if (image) {
      await this.deleteImage(media_key);
      const newImage = await this.uploadImage(image);
      media_key = newImage.Location;
      media_url = newImage.Key;
    }
    const newPost = await this._Post.findByIdAndUpdate(postId, {
      content,
      media_url,
      media_key,
      updated_at,
      tags,
    });
    if (!newPost) {
      throw new Error("Postingan gagal diperbarui");
    }
  }

  async deleteMyPost(postId, userId) {
    await this.verifyPost(postId, userId);
    const myPost = await this._Post.findById(postId);
    if (myPost.media_url !== null) {
      const media_key = myPost.media_key;
      await this.deleteImage(media_key);
    }
    const delMyPost = await this._Post.findByIdAndDelete(postId);
    if (!delMyPost) {
      throw new Error("postingan gagal dihapus");
    }
  }

  async getPostByFollowing(userId) {
    const myUser = await this._User.findById(userId).select("following");
    const userFollowingId = myUser.following;

    const posts = await this._Post
      .find({
        user_id: { $in: userFollowingId },
      })
      .sort({ created_at: -1 });

    if (!posts || posts.length === 0) {
      return "No Post";
    }

    const users = await this._User
      .find({
        _id: { $in: userFollowingId },
      })
      .select("_id username avatar_url");

    const userMap = new Map();
    users.forEach((user) => {
      userMap.set(user._id, {
        username: user.username,
        avatar_url: user.avatar_url,
      });
    });

    return posts.map((post) => ({
      content: post.content,
      media_url: post.media_url,
      tags: post.tags,
      created_at: post.created_at,
      total_like: post.likes.length,
      likes: post.likes,
      user_posted: userMap.get(post.user_id) || null,
    }));
  }
}

export default PostsService;
