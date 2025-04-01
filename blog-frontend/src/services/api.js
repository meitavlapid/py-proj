import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL;

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const fetchPosts = () => api.get("posts/");
export const fetchPostById = (id) => api.get(`posts/${id}/`);
export const newPost = ({ title, text, image = null, tags = [] }) => {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("text", text);
  if (image) formData.append("image", image);
  if (tags.length > 0) formData.append("tags", tags.join(","));

  return api.post("posts/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export const updatePost = (postId, data) => api.patch(`posts/${postId}/`, data);
export const deletePost = (postId) => api.delete(`posts/${postId}/`);

export const fetchComments = () => api.get("comments/");
export const fetchCommentsByPost = (postId) =>
  api.get(`comments/post/${postId}/`);
export const submitReply = (text, postId, replyTo = null) =>
  api.post("comments/", {
    text,
    post: postId,
    reply_to: replyTo,
  });
export const updateComment = (commentId, text) =>
  api.patch(`comments/${commentId}/`, { text });
export const deleteComment = (commentId) =>
  api.delete(`comments/${commentId}/`);

export const likePost = (postId) => api.post("likes/like/", { post: postId });
export const unlikePost = (postId) =>
  api.post("likes/unlike/", { post: postId });
export const fetchLikes = () => api.get("likes/");
export const fetchUsers = () => api.get("users/");
export const fetchCurrentUser = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) return null;

  try {
    const response = await api.get("users/me/");
    return response.data;
  } catch (error) {
    console.error(" שגיאה בטעינת משתמש:", error);
    return null;
  }
};

export const updateUserProfile = ({ bio, email }) =>
  api.patch("users/me/", { bio, email });
