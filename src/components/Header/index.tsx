import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
const image = '/images/logo.svg'

import styles from './header.module.scss'

export default function Header() {
  return (
    <div className={styles.header}>
      <Link href={'/'}>
        <a>
          <img src={image} alt="logo" />
        </a>
      </Link>
    </div>
  )
}
