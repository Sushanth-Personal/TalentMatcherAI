import { Link } from 'react-router-dom';
import styles from './Header.module.css';

function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.logo}>TalentMatch</div>
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLink}>Home</Link>
        <Link to="/match" className={styles.navLink}>Match Talent</Link>
        <Link to="/about" className={styles.navLink}>About</Link>
        <Link to="/login" className={styles.loginButton}>Login</Link>
      </nav>
    </header>
  );
}

export default Header;