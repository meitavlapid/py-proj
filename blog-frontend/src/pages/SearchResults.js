import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { fetchPosts } from "../services/api";
import "../css/Home.css";

const SearchResults = () => {
  const [params] = useSearchParams();
  const tag = params.get("tag");
  const query = params.get("query");

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getFiltered = async () => {
      try {
        const response = await fetchPosts();
        const allPosts = response.data;

        const filtered = allPosts.filter((post) => {
          const matchTag = tag && post.tags?.includes(tag);
          const matchQuery =
            query &&
            (post.title?.toLowerCase().includes(query.toLowerCase()) ||
              post.text?.toLowerCase().includes(query.toLowerCase()) ||
              post.author_username
                ?.toLowerCase()
                .includes(query.toLowerCase()));
          return matchTag || matchQuery;
        });

        setPosts(filtered);
      } catch (err) {
        console.error(" שגיאה בחיפוש:", err);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    if (tag || query) {
      getFiltered();
    }
  }, [tag, query]);

  if (loading) return <h2>טוען תוצאות...</h2>;

  return (
    <div className="home-container">
      <header className="home-header">
        <h1>תוצאות חיפוש</h1>
        <p>
          תוצאות עבור:{" "}
          {tag ? <strong>תגית #{tag}</strong> : <strong>{query}</strong>}
        </p>
      </header>

      <section className="posts-section">
        {posts.length > 0 ? (
          posts.map((post) => (
            <div key={post.id} className="post-card">
              {post.image && (
                <img src={post.image} alt={post.title} className="post-image" />
              )}
              <h3>{post.title}</h3>
              <p>{post.text.substring(0, 100)}...</p>

              {post.tags?.length > 0 && (
                <div className="post-tags">
                  {post.tags.map((t, index) => (
                    <Link key={index} to={`/search?tag=${t}`} className="tag">
                      #{t}
                    </Link>
                  ))}
                </div>
              )}

              <Link to={`/posts/${post.id}`} className="read-more">
                קרא עוד
              </Link>
            </div>
          ))
        ) : (
          <p>לא נמצאו פוסטים תואמים לחיפוש.</p>
        )}
      </section>
    </div>
  );
};

export default SearchResults;
