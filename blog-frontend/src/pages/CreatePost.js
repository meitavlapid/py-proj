import { useState } from "react";
import {
  Container,
  TextField,
  Button,
  Typography,
  MenuItem,
  Stack,
  Paper,
} from "@mui/material";
import { newPost } from "../services/api";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [status, setStatus] = useState("draft");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await newPost({
        title,
        text,
        image: imageUrl,
        tags: tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        status,
      });
      alert(" פוסט נוצר בהצלחה!");
      setTitle("");
      setText("");
      setTags("");
      setImageUrl("");
      setStatus("draft");
    } catch (err) {
      console.error(" שגיאה ביצירת פוסט:", err);
      alert("שגיאה ביצירת פוסט");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          יצירת פוסט חדש
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <TextField
              label="כותרת"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="תוכן הפוסט"
              value={text}
              onChange={(e) => setText(e.target.value)}
              fullWidth
              multiline
              rows={6}
              required
            />
            <TextField
              label="תגיות (מופרדות בפסיקים)"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              fullWidth
            />
            <TextField
              label="סטטוס"
              select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              <MenuItem value="draft">טיוטה</MenuItem>
              <MenuItem value="published">פורסם</MenuItem>
            </TextField>
            <TextField
              label="קישור לתמונה"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              fullWidth
              placeholder="https://example.com/image.jpg"
            />
            {imageUrl && (
              <img
                src={imageUrl}
                alt="תצוגה מקדימה"
                style={{
                  maxWidth: "100%",
                  marginTop: "1rem",
                  borderRadius: "8px",
                }}
              />
            )}
            <Button
              variant="contained"
              color="primary"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? "שולח..." : "פרסם פוסט"}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Container>
  );
};

export default CreatePost;
