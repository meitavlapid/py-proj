import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL;

export const login = async (username, password) => {
  try {
    const response = await axios.post(
      `${API_URL}token/`,
      { username, password },
      { headers: { "Content-Type": "application/json" } }
    );

    const { access, refresh } = response.data;

    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);

    const userData = jwtDecode(access);
    localStorage.setItem("user", JSON.stringify(userData));

    return response.data;
  } catch (error) {
    console.error(" התחברות נכשלה:", error.response?.data || error.message);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

export const getCurrentUser = () => {
  const token = localStorage.getItem("accessToken");
  try {
    return token ? jwtDecode(token) : null;
  } catch {
    return null;
  }
};

export const register = async ({
  username,
  email,
  password,
  first_name,
  last_name,
}) => {
  const response = await axios.post(`${API_URL}auth/register/`, {
    username,
    email,
    password,
    first_name,
    last_name,
  });

  return response.data;
};
