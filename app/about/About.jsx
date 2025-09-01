import styles from "./about.module.css";
import '../../styles/globals.css';
import SEO from "../../components/SEO";

const team = [
  { name: "Sagar", role: "Founder / Dev" },
  { name: "Sagar Khanal", role: "Designer" },
  // { name: "Player Three", role: "Community" },
];

export default function About() {
  return (
    <section className={styles.wrap}>
      <SEO jsonld={{ "@context": "https://schema.org", "@type": "AboutPage", "name": "About Khelira" }} />
      <h1>About – Learn @ Khelira</h1>
      <p>Learn @ Khelira is a modern, minimalist platform dedicated to helping you explore web development, programming, and other tech courses in a smooth and engaging way.</p>
      <h2>Mission</h2>
      <p>Provide focused, interactive learning experiences that are easy to follow, practical, and memorable. Our courses are designed to spark curiosity, build skills, and help you grow in the tech world.</p>


      <h2>What We Do</h2>
      

        <ul>

          <li>  Offer structured tutorials and courses on web development, coding, and modern technologies. </li>
          <li> Deliver learning experiences that are lightweight, fast-loading, and distraction-free. </li>
          <li>Create a community where learners can experiment, practice, and level up their skills.</li>

        </ul>

      

      {/* <h2>Team</h2>
      <div className={styles.team}>
        {team.map((t)=>(
          <article key={t.name} className={styles.card} aria-label={`${t.name} card`}>
            <div className={styles.avatar} role="img" aria-label={`${t.name} avatar`} />
            <h3 style={{marginBottom:0}}>{t.name}</h3>
            <p style={{color:"var(--muted)"}}>{t.role}</p>
          </article>
        ))}
      </div> */}
    </section>
  );
}
