import React, { useEffect, useState } from "react";
import MenuIcon from "@mui/icons-material/Menu";
import {
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Avatar,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { fetchCurrentUser } from "../services/api";
import { useUser } from "../services/UserContext";
import "../css/Navbar.css";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, setUser } = useUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const isLoggedIn = !!user?.username;
  const profileImage = user?.profile_pic || null;

  useEffect(() => {
    const tokenExists = localStorage.getItem("accessToken");
    if (!user && tokenExists) {
      fetchCurrentUser().then((response) => {
        if (response) {
          setUser(response);
        }
      });
    }
  }, [user, setUser]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    navigate("/login");
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar className="navbar-toolbar">
          <Box className="navbar-section right">
            <Typography
              variant="h6"
              className="navbar-title"
              component={Link}
              to="/home"
            >
              📝 בלוג קהילתי
            </Typography>
          </Box>

          {isLoggedIn && (
            <Box
              className="navbar-section center"
              component={Link}
              to="/profile"
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                textDecoration: "none",
                color: "white",
              }}
            >
              {profileImage && (
                <Avatar
                  src={profileImage}
                  alt={user.username}
                  sx={{ width: 32, height: 32 }}
                />
              )}
              <Typography variant="h6">שלום {user.username}</Typography>
            </Box>
          )}

          <Box
            className="navbar-section left"
            sx={{ display: { xs: "none", sm: "flex" } }}
          >
            {isLoggedIn ? (
              <>
                <Button component={Link} to="/create-post" color="inherit">
                  יצירת פוסט
                </Button>
                <Button onClick={handleLogout} color="inherit">
                  יציאה
                </Button>
              </>
            ) : (
              <Button component={Link} to="/login" color="inherit">
                התחברות
              </Button>
            )}
          </Box>

          <IconButton
            sx={{ display: { xs: "flex", sm: "none" }, color: "white" }}
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List sx={{ width: 200, textAlign: "right" }}>
          {isLoggedIn && (
            <ListItem
              button
              component={Link}
              to="/profile"
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary={`שלום ${user.username}`} />
            </ListItem>
          )}
          {isLoggedIn ? (
            <>
              <ListItem
                button
                component={Link}
                to="/create-post"
                onClick={() => setDrawerOpen(false)}
              >
                <ListItemText primary="יצירת פוסט" />
              </ListItem>
              <ListItem
                button
                onClick={() => {
                  handleLogout();
                  setDrawerOpen(false);
                }}
              >
                <ListItemText primary="יציאה" />
              </ListItem>
            </>
          ) : (
            <ListItem
              button
              component={Link}
              to="/login"
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText primary="התחברות" />
            </ListItem>
          )}
          <Divider />
          <ListItem
            button
            component={Link}
            to="/home"
            onClick={() => setDrawerOpen(false)}
          >
            <ListItemText primary="דף הבית" />
          </ListItem>
        </List>
      </Drawer>
    </>
  );
};

export default Navbar;
