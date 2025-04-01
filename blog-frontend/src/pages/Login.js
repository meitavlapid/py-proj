import { useState } from "react";
import { login } from "../services/auth";
import { fetchCurrentUser } from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  TextField,
  Button,
  Container,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import { useUser } from "../services/UserContext";

const Login = () => {
  const { setUser } = useUser();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorOpen, setErrorOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(username, password);
      const userResponse = await fetchCurrentUser();
      setUser(userResponse);
      navigate("/home");
    } catch (error) {
      setErrorOpen(true);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 6 }}>
      <Typography variant="h4" gutterBottom>
        התחברות
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="שם משתמש"
          margin="normal"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <TextField
          fullWidth
          label="סיסמה"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          sx={{ mt: 2 }}
        >
          כניסה
        </Button>

        <Button fullWidth onClick={() => navigate("/register")} sx={{ mt: 1 }}>
          אין לך חשבון? הירשם כאן
        </Button>
      </form>

      <Snackbar
        open={errorOpen}
        autoHideDuration={4000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={() => setErrorOpen(false)}
          severity="error"
          sx={{ width: "100%" }}
        >
          שם משתמש או סיסמה שגויים
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Login;
