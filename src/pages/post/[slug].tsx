import { GetStaticPaths, GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import { IoCalendarClearOutline, IoPersonOutline, IoTimeOutline } from 'react-icons/io5';

interface Post {
  first_publication_date: string | null;
  date?: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    updatedAt: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const [timePosted, setTimePosted] = useState('')

  useEffect(() => {
    const datePostPublicated = post.data.publicationDate;
    const dateNow = +new Date;
    const timeAgo = new Date(dateNow - datePostPublicated).getTime();
    const minutes = timeAgo / 60000;
    const hours = minutes / 60;
    const days = hours / 24;
    if (days >= 1) {
      setTimePosted(parseInt(days) + ` dia` + (days > 1 ? 's' : ''))
    } else if (hours > 1) {
      setTimePosted(parseInt(hours) + ' hora' + (hours > 1 ? 's' : ''))
    } else if (minutes > 5) {
      setTimePosted((parseInt(minutes) + ' minuto' + (minutes > 1 ? 's' : '')))
    } else if (minutes >= 0) {
      setTimePosted('Postado a poucos minutos')
    }
  }, [])
  console.log(post)
  return (
    <main>
      <div className={styles.banner}>
        <img src={post.data.banner.url} height={440} alt="Opa" />
      </div>
      <section className={styles.container}>
        <strong>{post.data.title}</strong>
        <div>
          <time className={styles.data}><IoCalendarClearOutline /> {post.data.updatedAt}</time>
          <div className={styles.data}><IoPersonOutline />{post.data.author}</div>
          <time className={styles.data}><IoTimeOutline />{timePosted}</time>
        </div>
        <article>
          {post.data.content.map((content, index) => {
            return (
              <div key={index}>
                <strong>{content.heading}</strong>
                <p>{content.body[0].text}</p>
              </div>
            )
          })}
        </article>
      </section>
    </main>
  )
}

export const getStaticPaths = async () => {
  const prismic = getPrismicClient();
  return {
    paths: [],
    fallback: 'blocking'
  }
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const prismic = getPrismicClient();
  const { slug } = params;
  const response = await prismic.getByUID('posts', String(slug), {})
  console.log(response)
  const post = {
    slug,
    data:{
      title: RichText.asText(response.data.title),
      author: RichText.asText(response.data.author),
      subtitle: RichText.asText(response.data.subtitle),
      banner: response.data.banner,
      content: response.data.content,
      updatedAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }
      ),
      publicationDate: Date.parse(response.last_publication_date),
    }
  }
  return {
    props: {
      post,
    }
  }
}
