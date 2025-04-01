import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchPostById, updatePost } from "../services/api";
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Snackbar,
  Alert,
  Paper,
} from "@mui/material";

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const { data } = await fetchPostById(id);
        setTitle(data.title);
        setText(data.text);
        setTags(data.tags?.join(", ") || "");
        setImageUrl(data.image || "");
      } catch (err) {
        console.error(" שגיאה בטעינת הפוסט:", err);
        setError("שגיאה בטעינת הפוסט");
      }
    };

    loadPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const postData = {
      title,
      text,
      image: imageUrl,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    };

    try {
      await updatePost(id, postData);
      setSuccess(true);
      setTimeout(() => navigate(`/posts/${id}`), 1500);
    } catch (err) {
      console.error(" שגיאה בשמירת הפוסט:", err);
      setError("שגיאה בשמירת הפוסט");
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          עריכת פוסט
        </Typography>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            label="כותרת"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            fullWidth
            required
            margin="normal"
          />

          <TextField
            label="תוכן"
            value={text}
            onChange={(e) => setText(e.target.value)}
            fullWidth
            multiline
            rows={6}
            required
            margin="normal"
          />

          <TextField
            label="תגיות (מופרדות בפסיקים)"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            fullWidth
            margin="normal"
          />

          <TextField
            label="כתובת תמונה (URL)"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            fullWidth
            margin="normal"
          />

          {imageUrl && (
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                תצוגה מקדימה:
              </Typography>
              <img
                src={imageUrl}
                alt="תמונה מקדימה"
                style={{
                  maxWidth: "100%",
                  maxHeight: 300,
                  borderRadius: 8,
                  boxShadow: "0 2px 10px rgba(0,0,0,0.15)",
                }}
                onError={(e) => (e.target.style.display = "none")}
              />
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
          >
            שמור שינויים
          </Button>
        </Box>
      </Paper>

      <Snackbar
        open={!!error}
        autoHideDuration={4000}
        onClose={() => setError("")}
      >
        <Alert severity="error" onClose={() => setError("")}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={success}
        autoHideDuration={2500}
        onClose={() => setSuccess(false)}
      >
        <Alert severity="success">הפוסט עודכן בהצלחה!</Alert>
      </Snackbar>
    </Container>
  );
};

export default EditPost;
