import React, { useState } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Snackbar,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { register } from "../services/auth";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    first_name: "",
    last_name: "",
  });

  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      setSuccessOpen(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      console.error(" Registration failed:", err);
      setErrorOpen(true);
    }
  };

  return (
    <Container maxWidth="xs">
      <Typography variant="h4" gutterBottom>
        הרשמה
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="שם משתמש"
          name="username"
          value={form.username}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="אימייל"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="סיסמה"
          name="password"
          type="password"
          value={form.password}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="שם פרטי"
          name="first_name"
          value={form.first_name}
          onChange={handleChange}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="שם משפחה"
          name="last_name"
          value={form.last_name}
          onChange={handleChange}
          margin="normal"
          required
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          sx={{ mt: 2 }}
        >
          הרשמה
        </Button>

        <Button fullWidth onClick={() => navigate("/login")} sx={{ mt: 1 }}>
          כבר יש לי חשבון
        </Button>
      </form>

      <Snackbar
        open={successOpen}
        autoHideDuration={3000}
        onClose={() => setSuccessOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" sx={{ width: "100%" }}>
          ההרשמה הצליחה! מעביר לדף התחברות...
        </Alert>
      </Snackbar>

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="error" sx={{ width: "100%" }}>
          שגיאה בהרשמה. נסה שוב.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Register;
