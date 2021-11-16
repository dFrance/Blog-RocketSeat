import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client'
import { getPrismicClient } from '../services/prismic';
import Link from 'next/link';
import { RichText } from 'prismic-dom'


import { IoIosCalendar, IoMdPerson } from "react-icons/io";

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { useState } from 'react';

interface Post {
  slug: string;
  first_publication_date: string | null;
  title: string;
  subtitle: string;
  author: string;
  banner: string;
  heading: string;
  content: string;
  updatedAt: string;
}

interface PostPagination {
  next_page: string;
  posts: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}
export default function Home({ posts, next_page }: PostPagination) {
  const [listposts, setListPosts] = useState(posts)
  const [nextPageUrl, setNextPageUrl] = useState(next_page)

  function nextPage() {
    const nextPage = fetch(nextPageUrl)
      .then((response) => response.json())
      .then(data => {
        const formattedPosts = data.results.map(post => {
          return {
            slug: post.slugs[0],
            title: post.title[0].text,
            subtitle: post.subtitle[0].text,
            author: post.author[0].text,
            updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: 'long',
              year: 'numeric'
            })
          }
        })
        setNextPageUrl(data.next_page)
        setListPosts([...listposts, ...formattedPosts])
      })

  }
  return (
    <main className={styles.content}>
      {listposts.map((post, index) => {
        return (
          <div key={index} className={styles.posts} >
            <Link href={`/post/${post.slug}`}>
              <a href="">
                <strong>{post.title}</strong>
                <p>{post.subtitle}</p>
                <div>
                  <time><IoIosCalendar /> {post.updatedAt}</time>
                  <section><IoMdPerson /> {post.author}</section>
                </div>
              </a>
            </Link>
          </div>
        )
      })}
      {nextPageUrl !== null &&
        <button onClick={nextPage} className={styles.highlight}>
          Carregar mais posts
        </button>
      }
    </main >
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();

  const postsResponse = await prismic.query([
    Prismic.predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.content', 'posts.author', 'posts.subtitle'],
    pageSize: 1,
  });

  const posts = postsResponse.results.map(post => {
    return {
      slug: post.uid,
      title: RichText.asText(post.data.title),
      author: RichText.asText(post.data.author),
      subtitle: RichText.asText(post.data.subtitle),
      updatedAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
      }
      )
    }
  })

  return {
    props: {
      posts,
      next_page: postsResponse.next_page,
    }
  }
};
