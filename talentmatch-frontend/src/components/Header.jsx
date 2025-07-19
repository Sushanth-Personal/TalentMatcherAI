import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>BreadButter</h1>
      <nav className={styles.nav}>
        <Link to="/" className={styles.link}>Home</Link>
        <Link to="/match" className={styles.link}>Match Talent</Link>
        <Link to="/creators" className={styles.link}>Creators</Link>
        <Link to="/about" className={styles.link}>About</Link>
        <button className={styles.loginButton}>Log in</button>
      </nav>
    </header>
  );
}

export default Header;