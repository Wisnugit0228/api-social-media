import UsersService from "../../services/usersService.js";
import usersValidator from "../../validator/usersValidator/index.js";
const userService = new UsersService();

export const LoginUserHandler = async (req, res) => {
  try {
    usersValidator.loginUserValidate(req.body);
    const { username, password } = req.body;
    const data = await userService.LoginUser({ username, password });
    res.cookie("refreshTokenAccess", data.refreshToken, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
    });
    res.status(200).json({
      status: "success",
      data: {
        accessToken: data.accessToken,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const RefreshTokenHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshTokenAccess;
    const token = await userService.RefreshToken(refreshToken);
    res.status(200).json({
      status: "success",
      data: token,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const postUserHandler = async (req, res) => {
  try {
    usersValidator.usersValidate(req.body);
    const { username, email, password, bio } = req.body;
    const image = req.file;

    const userId = await userService.addUser({ username, email, image, password, bio });
    res.status(201).json({
      status: "success",
      data: {
        userId,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getUsersHandler = async (req, res) => {
  try {
    const { username } = req.body || {};
    const users = await userService.getUser({ username });
    res.status(200).json({
      status: "success",
      data: users,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const getuserByIdHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const user = await userService.getUserById(id, { userId });
    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const addFollowHandler = async (req, res) => {
  try {
    const { targetUsername } = req.params;
    const refreshToken = req.cookies.refreshTokenAccess;
    const userId = req.userId;
    await userService.addFollow(targetUsername, { userId, refreshToken });
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const LogoutUserHandler = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshTokenAccess;
    await userService.LogoutUser(refreshToken);
    res.clearCookie("refreshTokenAccess");
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};

export const putUserByIdHandler = async (req, res) => {
  try {
    const userId = req.userId;
    const { id } = req.params;
    const { bio } = req.body || {};
    const image = req.file;
    await userService.editUserById(id, userId, { image, bio });
    res.status(200).json({
      status: "success",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: error.message,
    });
  }
};
