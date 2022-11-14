import { Pane, majorScale } from 'evergreen-ui'

import Container from '../../components/container'
import HomeNav from '../../components/homeNav'
import PostPreview from '../../components/postPreview'
import React from 'react'
import fs from 'fs'
import matter from 'gray-matter'
import orderby from 'lodash.orderby'
import path from 'path'
import { posts as postsFromCMS } from '../../content'

const Blog = ({ posts }) => {
  return (
    <Pane>
      <header>
        <HomeNav />
      </header>
      <main>
        <Container>
          {posts.map((post) => (
            <Pane key={post.title} marginY={majorScale(5)}>
              <PostPreview post={post} />
            </Pane>
          ))}
        </Container>
      </main>
    </Pane>
  )
}

Blog.defaultProps = {
  posts: [],
}

/**
 * Need to get the posts from the
 * fs and our CMS
 */

export async function getStaticProps(ctx) {
  // read the posts dir from the fs
  const postsDirectory = path.join(process.cwd(), 'posts')
  const filenames = fs.readdirSync(postsDirectory)
  // get each post from the fs
  const filePosts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename)
    return fs.readFileSync(filePath, 'utf8')
  })

  // merge our posts from our CMS and fs then sort by pub date
  const posts = ctx.preview ? postsFromCMS.draft : postsFromCMS.published

  const orderedPosts = orderby(
    [...posts, ...filePosts].map((content) => {
      // extract frontmatter from markdown content
      const { data } = matter(content)
      return data
    }),
    ['publishedOn'],
    ['desc'],
  )

  return { props: { posts: orderedPosts } }
}

export default Blog
