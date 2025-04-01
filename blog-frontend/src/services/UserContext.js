import { createContext, useContext, useState, useEffect } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const storedUser = JSON.parse(localStorage.getItem("user")); 
  const [user, setUser] = useState(storedUser || null);

  useEffect(() => {
    if (user) {
      localStorage.setItem("user", JSON.stringify(user)); 
    } else {
      localStorage.removeItem("user");
    }
  }, [user]); 

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
