import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../services/UserContext";
import {
  fetchPostById,
  deletePost,
  likePost,
  unlikePost,
  fetchCommentsByPost,
  submitReply,
  deleteComment,
  updateComment,
} from "../services/api";
import {
  Container,
  Typography,
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  IconButton,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import "../css/PostDetails.css";

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editText, setEditText] = useState("");
  const [likeCount, setLikeCount] = useState(0);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await fetchPostById(id);
        setPost(res.data);
        setLiked(res.data.is_liked_by_me);
        setLikeCount(res.data.likes_count || 0);
      } catch (err) {
        setError("שגיאה בטעינת הפוסט");
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [id]);

  useEffect(() => {
    if (!post) return;
    const loadComments = async () => {
      try {
        const res = await fetchCommentsByPost(id);
        setComments(res.data);
      } catch (err) {
        console.error(" שגיאה בטעינת תגובות:", err);
      }
    };

    loadComments();
  }, [post, id]);

  const handleReplySubmit = async () => {
    if (!replyText.trim()) return;

    try {
      await submitReply(replyText, post.id, replyingTo);
      const updated = await fetchCommentsByPost(post.id);
      setComments(updated.data);
      setReplyText("");
      setReplyingTo(null);
    } catch (err) {
      console.error(" שגיאה בשליחת תגובה:", err);
    }
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    try {
      await updateComment(editingCommentId, editText);
      const updated = await fetchCommentsByPost(post.id);
      setComments(updated.data);
      setEditingCommentId(null);
      setEditText("");
    } catch (err) {
      console.error(" שגיאה בעריכת תגובה:", err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("בטוח שברצונך למחוק תגובה זו?")) return;
    try {
      await deleteComment(commentId);
      const updated = await fetchCommentsByPost(post.id);
      setComments(updated.data);
    } catch (err) {
      console.error(" שגיאה במחיקת תגובה:", err);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("האם למחוק את הפוסט?")) return;
    await deletePost(post.id);
    navigate("/home");
  };

  const handleLikeToggle = async () => {
    try {
      if (liked) {
        await unlikePost(post.id);
        setLiked(false);
        setLikeCount((prev) => prev - 1);
      } else {
        await likePost(post.id);
        setLiked(true);
        setLikeCount((prev) => prev + 1);
      }
    } catch (err) {
      console.error(" שגיאה בלייק:", err);
    }
  };

  const renderComments = (commentsList) =>
    commentsList.map((comment) => {
      const isCurrentUser = user?.username === comment.author_username;
      const isAdmin = user?.is_superuser;

      return (
        <Paper key={comment.id} elevation={2} sx={{ p: 2, mb: 2 }}>
          <Typography variant="subtitle2">{comment.author_username}</Typography>

          {editingCommentId === comment.id ? (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
              <Stack direction="row" spacing={1} mt={1}>
                <Button variant="contained" onClick={handleSaveEdit}>
                  שמור
                </Button>
                <Button onClick={() => setEditingCommentId(null)}>ביטול</Button>
              </Stack>
            </Box>
          ) : (
            <Typography variant="body1">{comment.text}</Typography>
          )}

          <Typography variant="caption" color="text.secondary">
            {new Date(comment.created_at).toLocaleString()}
          </Typography>

          <Box sx={{ mt: 1 }}>
            {(isCurrentUser || isAdmin) && (
              <>
                <Button
                  size="small"
                  onClick={() => handleEditComment(comment.id, comment.text)}
                  startIcon={<EditIcon />}
                />
                <Button
                  size="small"
                  color="error"
                  onClick={() => handleDeleteComment(comment.id)}
                  startIcon={<DeleteIcon />}
                />
              </>
            )}
            <Button
              size="small"
              onClick={() =>
                setReplyingTo(replyingTo === comment.id ? null : comment.id)
              }
            >
              {replyingTo === comment.id ? "ביטול" : "הגב"}
            </Button>
          </Box>

          {replyingTo === comment.id && (
            <Box sx={{ mt: 1 }}>
              <TextField
                fullWidth
                multiline
                rows={2}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="כתוב תגובה..."
              />
              <Button
                sx={{ mt: 1 }}
                variant="contained"
                onClick={handleReplySubmit}
              >
                שלח תגובה
              </Button>
            </Box>
          )}

          {comment.replies && comment.replies.length > 0 && (
            <Box sx={{ mt: 2, ml: 4 }}>{renderComments(comment.replies)}</Box>
          )}
        </Paper>
      );
    });

  if (loading) return <h2>טוען...</h2>;
  if (error) return <Alert severity="error">{error}</Alert>;

  const isOwner = post && (user?.id === post.author_id || user?.is_superuser);

  return (
    <Container sx={{ mt: 4 }}>
      {post.image && (
        <img src={post.image} alt={post.title} className="post-cover-image" />
      )}
      <Typography variant="h3">{post.title}</Typography>
      <Typography variant="subtitle2" color="text.secondary">
        נכתב על ידי {post.author_username} בתאריך{" "}
        {new Date(post.created_at).toLocaleDateString()}
      </Typography>

      <Typography variant="body1" sx={{ mt: 2 }}>
        {post.text}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, my: 2 }}>
        <IconButton
          onClick={handleLikeToggle}
          color={liked ? "error" : "default"}
        >
          {liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
        <Typography>{likeCount} אהבו את זה</Typography>
      </Box>

      {post.tags?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" color="primary">
            תגיות:
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}>
            {post.tags.map((tag, idx) => (
              <Box
                key={idx}
                sx={{
                  px: 1.5,
                  py: 0.5,
                  borderRadius: "12px",
                  backgroundColor: "#e0e0e0",
                  fontSize: "0.85rem",
                }}
              >
                #{tag}
              </Box>
            ))}
          </Box>
        </Box>
      )}

      {isOwner && (
        <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/edit-post/${post.id}`)}
          >
            ערוך
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeletePost}
          >
            מחק
          </Button>
        </Stack>
      )}

      {user ? (
        <Box sx={{ mt: 4 }}>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="כתוב תגובה..."
          />
          <Button
            sx={{ mt: 1 }}
            variant="contained"
            onClick={handleReplySubmit}
          >
            שלח תגובה
          </Button>
        </Box>
      ) : (
        <Alert severity="info" sx={{ mt: 3 }}>
          כדי לכתוב תגובה יש להתחבר.{" "}
          <Link to="/login" style={{ fontWeight: "bold" }}>
            התחבר עכשיו
          </Link>
        </Alert>
      )}

      <Typography variant="h5" sx={{ mt: 5 }}>
        תגובות
      </Typography>
      {comments.length ? (
        renderComments(comments)
      ) : (
        <Typography>אין תגובות עדיין.</Typography>
      )}
    </Container>
  );
};

export default PostDetails;
