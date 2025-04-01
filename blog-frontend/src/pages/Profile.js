import React from "react";
import {
  Container,
  Typography,
  Box,
  Avatar,
  Divider,
  Button,
} from "@mui/material";
import { useUser } from "../services/UserContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  if (!user) return <Typography>טוען פרופיל...</Typography>;

  return (
    <Container maxWidth="sm" sx={{ mt: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Avatar
          src={user.profile_pic}
          alt={user.username}
          sx={{ width: 80, height: 80 }}
        />
        <Typography variant="h5">שלום {user.username}</Typography>
      </Box>

      <Divider sx={{ mb: 3 }} />

      <ProfileItem label="שם פרטי" value={user.first_name} />
      <ProfileItem label="שם משפחה" value={user.last_name} />
      <ProfileItem label="אימייל" value={user.email} />
      <ProfileItem
        label="תאריך לידה"
        value={
          user.birth_date ? new Date(user.birth_date).toLocaleDateString() : ""
        }
      />
      <ProfileItem label="ביוגרפיה" value={user.bio || "אין ביוגרפיה עדיין"} />
      <ProfileItem
        label="תפקיד"
        value={
          user.is_superuser ? "מנהל" : user.is_staff ? "צוות" : "משתמש רגיל"
        }
      />

      <Box mt={4}>
        <Button variant="contained" onClick={() => navigate("/profile/edit")}>
          ערוך פרופיל
        </Button>
      </Box>
    </Container>
  );
};

const ProfileItem = ({ label, value }) => (
  <Typography variant="subtitle1" gutterBottom>
    <strong>{label}:</strong> {value || "לא צויין"}
  </Typography>
);

export default Profile;
