import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export interface RedditPost {
  id: string
  title: string
  author: string
  subreddit: string
  selftext: string
  score: number
  num_comments: number
  url: string
  permalink?: string
  created_utc: number
  thumbnail: string
}

export interface RedditComment {
  id: string
  author: string
  body: string
  score: number
  created_utc: number
  replies: RedditComment[]
}

interface RedditPostsResponse {
  data: {
    children: Array<{
      data: RedditPost
    }>
    after: string | null
  }
}

// Reddit API doesn't require authentication for public data
export const redditApiSlice = createApi({
  baseQuery: fetchBaseQuery({
    baseUrl: "https://www.reddit.com",
    // Reddit requires a User-Agent header
    prepareHeaders: headers => {
      headers.set("User-Agent", "RedditApp/1.0")
      return headers
    },
  }),
  reducerPath: "redditApi",
  tagTypes: ["Posts", "Comments"],
  endpoints: build => ({
    // Get top posts from a subreddit
    getSubredditPosts: build.query<
      RedditPost[],
      { subreddit: string; limit?: number; timeframe?: string }
    >({
      query: ({ subreddit, limit = 25, timeframe = "day" }) =>
        `/r/${subreddit}/top.json?limit=${limit}&t=${timeframe}`,
      transformResponse: (response: RedditPostsResponse) =>
        response.data.children.map(child => child.data),
      providesTags: (_result, _error, { subreddit }) => [
        { type: "Posts", id: subreddit },
      ],
    }),

    // Get comments for a specific post
    getPostComments: build.query<
      RedditComment[],
      { subreddit: string; postId: string }
    >({
      query: ({ subreddit, postId }) =>
        `/r/${subreddit}/comments/${postId}.json`,
      transformResponse: (response: any) => {
        // The response is an array: [post, comments]
        const commentsData = response[1]?.data?.children || []
        return commentsData.map((child: any) => child.data)
      },
      providesTags: (_result, _error, { postId }) => [
        { type: "Comments", id: postId },
      ],
    }),

    // Get posts from feed (popular)
    getPopularPosts: build.query<
      RedditPost[],
      { limit?: number; timeframe?: string }
    >({
      query: ({ limit = 25, timeframe = "day" }) =>
        `/r/popular/top.json?limit=${limit}&t=${timeframe}`,
      transformResponse: (response: RedditPostsResponse) =>
        response.data.children.map(child => child.data),
      providesTags: ["Posts"],
    }),

    // Search posts
    searchPosts: build.query<
      RedditPost[],
      { query: string; subreddit?: string; limit?: number }
    >({
      query: ({ query, subreddit = "all", limit = 25 }) => {
        const searchQuery = encodeURIComponent(query)
        return `/r/${subreddit}/search.json?q=${searchQuery}&limit=${limit}&restrict_sr=true`
      },
      transformResponse: (response: RedditPostsResponse) =>
        response.data.children.map(child => child.data),
      providesTags: ["Posts"],
    }),
  }),
})

export const {
  useGetSubredditPostsQuery,
  useGetPostCommentsQuery,
  useGetPopularPostsQuery,
  useSearchPostsQuery,
} = redditApiSlice
