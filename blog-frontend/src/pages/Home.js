import React, { useEffect, useState } from "react";
import { fetchPosts } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import { TextField, InputAdornment } from "@mui/material";
import "../css/Home.css";

const Home = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  useEffect(() => {
    const getPosts = async () => {
      try {
        const response = await fetchPosts();
        setPosts(response.data);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("שגיאה בטעינת הפוסטים");
      } finally {
        setLoading(false);
      }
    };

    getPosts();
  }, []);

  if (loading) return <h2>טוען פוסטים...</h2>;
  if (error) return <h2>{error}</h2>;
  if (!posts.length) return <h2>אין פוסטים זמינים כרגע</h2>;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>ברוכים הבאים לבלוג שלנו</h1>
        <p>קראו את המאמרים האחרונים מהקהילה שלנו</p>
      </header>

      <form onSubmit={handleSearch} className="search-form">
        <div className="search-wrapper">
          <TextField
            className="search-input"
            variant="outlined"
            placeholder="חפש פוסטים או תגיות..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <button type="submit" className="icon-button">
                    <SearchIcon />
                  </button>
                </InputAdornment>
              ),
            }}
          />
          <button type="submit" className="search-btn">
            חפש
          </button>
        </div>
      </form>

      <section className="posts-section">
        {posts.slice(0, visibleCount).map((post) => (
          <div key={post.id} className="post-card">
            {post.image && (
              <img src={post.image} alt={post.title} className="post-image" />
            )}
            <h3>{post.title}</h3>
            <p>{post.text}</p>

            {post.tags && post.tags.length > 0 && (
              <div className="post-tags">
                {post.tags.map((tag, index) => (
                  <Link key={index} to={`/search?tag=${tag}`} className="tag">
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <Link to={`/posts/${post.id}`} className="read-more">
              קרא עוד
            </Link>
          </div>
        ))}
      </section>

      {visibleCount < posts.length && (
        <div className="load-more-wrapper">
          <button
            className="load-more-btn"
            onClick={() => setVisibleCount((prev) => prev + 3)}
          >
            טען עוד פוסטים
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
