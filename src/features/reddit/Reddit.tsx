import type { JSX } from "react"
import { useState } from "react"
import styles from "./Reddit.module.css"
import { useGetSubredditPostsQuery } from "./redditApiSlice"

const POPULAR_SUBREDDITS = ["programming", "reactjs", "typescript", "webdev", "learnprogramming"]
const TIMEFRAMES = [
  { label: "Today", value: "day" },
  { label: "This Week", value: "week" },
  { label: "This Month", value: "month" },
  { label: "All Time", value: "all" },
]

export const Reddit = (): JSX.Element => {
  const [selectedSubreddit, setSelectedSubreddit] = useState("programming")
  const [timeframe, setTimeframe] = useState("day")
  const { data: posts, isError, isLoading, isFetching, isSuccess, refetch } =
    useGetSubredditPostsQuery({
      subreddit: selectedSubreddit,
      limit: 25,
      timeframe,
    })

  return (
    <div className={styles.container}>
      <h1>Posts</h1>
      <div className={styles.controls}>
        <div className={styles.controlGroup}>
          <label htmlFor="subreddit">Subreddit:</label>
          <select
            id="subreddit"
            value={selectedSubreddit}
            onChange={e => setSelectedSubreddit(e.target.value)}
            className={styles.select}
          >
            {POPULAR_SUBREDDITS.map(sub => (
              <option key={sub} value={sub}>
                r/{sub}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.controlGroup}>
          <label htmlFor="timeframe">Timeframe:</label>
          <select
            id="timeframe"
            value={timeframe}
            onChange={e => setTimeframe(e.target.value)}
            className={styles.select}
          >
            {TIMEFRAMES.map(tf => (
              <option key={tf.value} value={tf.value}>
                {tf.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className={styles.posts}>
        {(isLoading || isFetching) && (
          <div className={styles.loading}>
            <h2>Loading posts from r/{selectedSubreddit}...</h2>
          </div>
        )}

        {isError && (
          <div className={styles.error}>
            <h2>Error loading posts</h2>
            <p>Failed to fetch Reddit posts.</p>
            <div>
              <button className={styles.select} onClick={() => refetch()}>
                Retry
              </button>
            </div>
          </div>
        )}

        {isSuccess && (!posts || posts.length === 0) && !isError && (
          <div className={styles.loading}>
            <h2>No posts found for r/{selectedSubreddit}</h2>
            <p>Try a different subreddit or widen the timeframe.</p>
            <div>
              <button className={styles.select} onClick={() => refetch()}>
                Retry
              </button>
            </div>
          </div>
        )}

        {posts && posts.length > 0 &&
          posts.map(post => {
            // Build a safe href for the post. Prefer `permalink` when present
            // (e.g. "/r/sub/comments/id/..."), else use absolute `url` when it
            // starts with http(s), otherwise prefix with reddit.com.
            const href = post.permalink
              ? `https://reddit.com${post.permalink}`
              : post.url && /^https?:\/\//i.test(post.url)
              ? post.url
              : `https://reddit.com${post.url && post.url.startsWith("/") ? "" : "/"}${post.url || ""}`

            return (
              <div key={post.id} className={styles.post}>
                <div className={styles.postHeader}>
                  <h3>
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {post.title}
                    </a>
                  </h3>
                </div>

              <div className={styles.contentWrapper}>
                <div style={{ flex: 1 }}>
                  <div className={styles.postMeta}>
                    <span>👤 {post.author}</span>
                    <span>📍 r/{post.subreddit}</span>
                    <span>⬆️ {post.score.toLocaleString()}</span>
                    <span>💬 {post.num_comments.toLocaleString()}</span>
                  </div>

                  {post.selftext && (
                    <p className={styles.postBody}>
                      {post.selftext.substring(0, 300)}
                      {post.selftext.length > 300 && "..."}
                    </p>
                  )}
                </div>

                {post.thumbnail &&
                  post.thumbnail !== "self" &&
                  post.thumbnail !== "default" &&
                  post.thumbnail.startsWith("http") && (
                    <img
                      src={post.thumbnail}
                      alt={post.title}
                      className={styles.thumbnail}
                      loading="lazy"
                    />
                  )}
              </div>
            </div>
          );})}
      </div>
    </div>
  )
}
