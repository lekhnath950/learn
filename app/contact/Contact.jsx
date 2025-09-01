// "use client";
// import styles from "./contact.module.css";
// import '../../styles/globals.css';
// import { useState } from "react";
// import SEO from "../../components/SEO";

// export default function Contact(){
//   const [sent, setSent] = useState(false);

//   function handleSubmit(e){
//     e.preventDefault();
//     try {
//       const payload = {
//         name: e.target.name.value,
//         email: e.target.email.value,
//         message: e.target.message.value,
//         ts: Date.now()
//       };
//       const arr = JSON.parse(localStorage.getItem("khelira:contact")||"[]");
//       arr.push(payload);
//       localStorage.setItem("khelira:contact", JSON.stringify(arr));
//       setSent(true);
//       e.target.reset();
//     } catch {}
//   }

//   return (
//     <section>
//       <SEO jsonld={{"@context":"https://schema.org","@type":"ContactPage","name":"Contact Khelira"}} />
//       <h1>Contact</h1>
//       <div className={styles.wrap}>
//         <form onSubmit={handleSubmit} className={styles.form} aria-label="Contact form">
//           {sent && <p role="status">Thanks! We’ll get back to you soon.</p>}
//           <label htmlFor="name">Name</label>
//           <input id="name" name="name" className={styles.input} required aria-required="true"/>
//           <label htmlFor="email">Email</label>
//           <input id="email" name="email" type="email" className={styles.input} required aria-required="true"/>
//           <label htmlFor="message">Message</label>
//           <textarea id="message" name="message" rows={5} className={styles.textarea} required aria-required="true"></textarea>
//           <button className="btn btn-accent" type="submit">Send</button>
//         </form>
//         <div className={styles.map} aria-label="Map">
//           <img src="/map-placeholder.svg" alt="Map placeholder" />
//         </div>
//       </div>
//     </section>
//   );
// }


"use client";
import styles from "./contact.module.css";
import '../../styles/globals.css';
import { useState } from "react";
import SEO from "../../components/SEO";

export default function Contact(){
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });

  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Use formData to create the mailto link
    window.location.href = `mailto:meits1905@gmail.com?subject=Message from ${formData.name}&body=${formData.message} (Reply to: ${formData.email})`;
    
    // The mailto link opens, so we can set the 'sent' state and reset the form
    setSent(true);
    setFormData({ name: "", email: "", message: "" });
  };

  return (
    <section>
      <SEO jsonld={{"@context":"https://schema.org","@type":"ContactPage","name":"Contact Khelira"}} />
      <h1>Contact</h1>
      <div className={styles.wrap}>
        <form onSubmit={handleSubmit} className={styles.form} aria-label="Contact form">
          {sent && <p role="status">Thanks! We’ll get back to you soon.</p>}
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            className={styles.input}
            required
            aria-required="true"
            value={formData.name}
            onChange={handleChange}
          />
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className={styles.input}
            required
            aria-required="true"
            value={formData.email}
            onChange={handleChange}
          />
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            rows={5}
            className={styles.textarea}
            required
            aria-required="true"
            value={formData.message}
            onChange={handleChange}
          ></textarea>
          <button className="btn btn-accent" type="submit">Send</button>
        </form>
        {/* <div className={styles.map} aria-label="Map">
          <img src="/map-placeholder.svg" alt="Map placeholder" />
        </div> */}
      </div>
    </section>
  );
}