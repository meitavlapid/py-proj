import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  TextField,
  Button,
  Paper,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useUser } from "../services/UserContext";
import { api } from "../services/api";

const EditProfile = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [bio, setBio] = useState("");
  const [profilePicUrl, setProfilePicUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setFirstName(user.first_name || "");
    setLastName(user.last_name || "");
    setEmail(user.email || "");
    setBirthDate(user.birth_date || "");
    setBio(user.bio || "");
    setProfilePicUrl(user.profile_pic || "");
  }, [user]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const formData = new FormData();
      formData.append("first_name", firstName);
      formData.append("last_name", lastName);
      formData.append("email", email);
      formData.append("birth_date", birthDate);
      formData.append("bio", bio);
      formData.append("profile_pic", profilePicUrl);

      const response = await api.patch("users/me/", formData);
      setUser({ ...user, ...response.data });
      alert("הפרופיל עודכן בהצלחה ");
      navigate("/profile");
    } catch (err) {
      console.error(" שגיאה בעדכון פרופיל:", err);
      alert("שגיאה בעדכון הפרופיל ");
    } finally {
      setSaving(false);
    }
  };

  if (!user) return null;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" gutterBottom>
          עריכת פרופיל
        </Typography>

        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar src={profilePicUrl} sx={{ width: 80, height: 80 }} />
        </Box>

        <TextField
          fullWidth
          label="קישור לתמונת פרופיל (URL)"
          value={profilePicUrl}
          onChange={(e) => setProfilePicUrl(e.target.value)}
          sx={{ mb: 2 }}
        />

        <TextField
          fullWidth
          label="שם פרטי"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="שם משפחה"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="תאריך לידה"
          type="date"
          InputLabelProps={{ shrink: true }}
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          sx={{ mb: 2 }}
        />
        <TextField
          fullWidth
          label="ביוגרפיה"
          multiline
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          sx={{ mb: 2 }}
        />

        <Button
          variant="contained"
          color="primary"
          onClick={handleSave}
          disabled={saving}
        >
          שמור שינויים
        </Button>
      </Paper>
    </Container>
  );
};

export default EditProfile;
