import { nanoid } from "nanoid";
import Users from "../models/usersModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import AWS from "aws-sdk";

class UsersService {
  constructor() {
    this._User = Users;
  }

  async uploadImage(image) {
    const s3 = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    const key = `avatar/${uuidv4()}-${image.originalname}`;

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

  async verifyUsername(username) {
    const query = await this._User.findOne({ username });
    if (query) {
      throw new Error("Username sudah digunakan");
    }
  }

  async verifyEmail(email) {
    const query = await this._User.findOne({ email });
    if (query) {
      throw new Error("Email sudah terdaftar");
    }
  }

  async verifyUser(id, userId) {
    const query = await this._User.findOne({ _id: id });
    if (!query) {
      throw new Error("User tidak ditemukan");
    }
    const match = query.id === userId;
    if (!match) {
      throw new Error("Resourch tidak ditemukan");
    }
  }

  async LoginUser({ username, password }) {
    const query = await this._User.findOne({ username });
    if (!query) {
      throw new Error("Username tidak ditemukan");
    }
    const hasedPassword = query.password;
    const match = await bcrypt.compare(password, hasedPassword);
    if (!match) {
      throw new Error("Password salah");
    }

    const userId = query.id;

    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "30s" });

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "30s" });

    await this._User.findOneAndUpdate(
      { _id: userId },
      {
        refresh_token: refreshToken,
      },
      { new: true }
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async LogoutUser(refreshToken) {
    if (!refreshToken) {
      throw new Error("Anda belum melakukan login");
    }
    await this._User.findOneAndUpdate(
      { refresh_token: refreshToken },
      {
        refresh_token: null,
      }
    );
  }

  async RefreshToken(refreshToken) {
    if (!refreshToken) {
      throw new Error("Anda belum melakukan login");
    }
    const query = await this._User.findOne({ refresh_token: refreshToken });
    if (!query) {
      throw new Error("Anda belum login");
    }
    const userId = query.id;

    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1000s" });

    return {
      accessToken,
    };
  }

  async addUser({ username, email, image, password, bio }) {
    await this.verifyUsername(username);
    await this.verifyEmail(email);
    let avatar_url = "";
    let key = "";
    if (image) {
      const image_url = await this.uploadImage(image);
      avatar_url = image_url.Location;
      key = image_url.Key;
    }
    const id = nanoid(16);
    const created_at = new Date().toISOString();
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = await this._User.create({
      _id: id,
      username,
      email,
      password: hashedPassword,
      bio,
      avatar_url: avatar_url,
      key: key,
      refresh_token: null,
      created_at,
      followers: [],
      following: [],
    });
    return query;
  }

  async getUser({ username }) {
    const filter = {};

    if (username) {
      filter.username = { $regex: username, $options: "i" };
    }

    const users = await this._User.find(filter);

    return users.map((user) => ({
      username: user.username,
      bio: user.bio,
      avatar_url: user.avatar_url,
      total_followers: user.followers.length,
      total_following: user.following.length,
    }));
  }

  async getUserById(id, { userId }) {
    await this.verifyUser(id, userId);
    const query = await this._User.findOne({ _id: id });

    const followers = await this._User
      .find({
        username: { $in: query.followers },
      })
      .select("username bio avatar_url");

    const cleanedFollowers = followers.map((f) => ({
      username: f.username,
      bio: f.bio,
      avatar_url: f.avatar_url,
    }));
    const following = await this._User
      .find({
        username: { $in: query.following },
      })
      .select("username bio avatar_url");

    const cleanedFollowing = following.map((f) => ({
      username: f.username,
      bio: f.bio,
      avatar_url: f.avatar_url,
    }));
    return {
      username: query.username,
      email: query.email,
      bio: query.bio,
      avatar_url: query.avatar_url,
      total_followers: query.followers.length,
      total_following: query.following.length,
      followers: cleanedFollowers,
      following: cleanedFollowing,
    };
  }

  async editUserById(id, userId, { image, bio }) {
    await this.verifyUser(id, userId);
    const user = await this._User.findById(userId);
    let avatar_url = user.avatar_url;
    let key = user.key;
    let newBio = user.bio;
    if (image) {
      const match = user.avatar_url === "";
      if (!match) {
        const key = user.key;
        await this.deleteImage(key);
      }
      const image_url = await this.uploadImage(image);
      avatar_url = image_url.Location;
      key = image_url.Key;
    }
    if (bio) {
      newBio = bio;
    }
    await this._User.findByIdAndUpdate(id, {
      avatar_url: avatar_url,
      key: key,
      bio: newBio,
    });
  }

  async verifyTargetUsername(targetUsername, refreshToken) {
    if (!refreshToken) {
      throw new Error("Anda belum melakukan login");
    }
    const query = await this._User.findOne({ username: targetUsername });
    if (!query) {
      throw new Error("Username tidak ditemukan");
    }
  }

  async addFollow(targetUsername, { userId, refreshToken }) {
    await this.verifyTargetUsername(targetUsername, refreshToken);
    const followerUser = await this._User.findById(userId);
    const targetUser = await this._User.findOne({ username: targetUsername });
    // add followers id to user target
    await this._User.findByIdAndUpdate(targetUser._id, {
      $addToSet: { followers: followerUser.username },
    });

    // add following id to user
    await this._User.findByIdAndUpdate(followerUser._id, {
      $addToSet: { following: targetUser.username },
    });
  }
}

export default UsersService;
