import styles from "./Footer.module.css";
import '../styles/globals.css';
import { FaGithub, FaXTwitter, FaGlobe } from "react-icons/fa6";
import AdUnit from "./AdUnit";

export default function Footer(){
  return (
<>
    <footer className={styles.footer}>
      <div className="container">
     <div className="ad-container">
        <AdUnit slotId="8345298729" />
      </div>
        
        
        <div className={styles.cols}>
          <div className={styles.col}>
            <h4>Khelira</h4>
            <p>Minimal, modern, and memorable playground for learning and coding</p>
          </div>
          <div className={styles.col}>
            <h4>Explore</h4>
            <ul>
              <li><a href="https://www.khelira.com/projects">Other Projects</a></li>
              <li><a href="https://typing.khelira.com">Typing Test</a></li>
              <li><a href="/learn">Learn - Tutorials</a></li>
            </ul>
          </div>
          <div className={styles.col}>
            <h4>Connect</h4>
            <p>
              <a href="https://github.com/coming-soon" aria-label="GitHub"><FaGithub aria-hidden="true" /></a>
              {" "}
              <a href="https://x.com/coming-soon" aria-label="Twitter / X"><FaXTwitter aria-hidden="true" /></a>
              {" "}
              <a href="https://khelira.com/" aria-label="Website"><FaGlobe aria-hidden="true" /></a>
            </p>
          </div>
        </div>
        <div className={styles.copy}>
          © {new Date().getFullYear()} Khelira. All rights reserved.
        </div>
      </div>
    </footer>

    </>
  )
}
