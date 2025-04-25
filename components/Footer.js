import React, { useState } from 'react';
import styles from './Footer.module.css';

const Footer = ({ shop,data }) => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    setSubmitted(true);

  };

  return (
    <>
      <section className="features">
        <div className='wrapper'>
          <div className='feature-item'>
            <img src="https://www.manomano.fr/assets/_next/static/images/save-money-b2c-2c84261bd1b89341.svg" alt="livraison gratuite" />
            <p>Le spécialiste français du bricolage, maison, jardin</p>
          </div>
          <div className='feature-item'>
            <img src='https://www.manomano.fr/assets/_next/static/images/delivery-b2c-5dfb15e01aa0381f.svg' alt="livraison gratuite" />
            <p>Livraison et retours gratuits pendant 100 jours</p>
          </div>
          <div className='feature-item'>
            <img src="https://www.manomano.fr/assets/_next/static/images/disponibility-b2c-c05d4d783dd84153.svg" alt="livraison gratuite" />
            <p>Paiement jusqu'à 4x sans frais et 100% sécurisé</p>
          </div>
          <div className='feature-item'>
          <img src="https://www.manomano.fr/assets/_next/static/images/trusted-partener-b2c-d08145f6785dbec1.svg" alt="livraison gratuite" />
            <p>Plus de 7 millions de clients particuliers</p>
          </div>
        </div>
      </section>
      <footer>
        <div className="wrapper">
          <article>
            <div className="footer-column">
              <a href="/"><h4>{shop.name}</h4></a>
              <p>{data.footerText}</p>
              <a className='mail' href={`mailto:support@${shop.domain}`}>support@{shop.domain}</a>
              
            </div>
            <div className="footer-column">
              <h4>{data.footerColumnLabel1}</h4>
              <ul>
                <li><a href="/all">{data.footerLink1}</a></li>
                <li><a href="/about">{data.footerLink2}</a></li>
                <li><a href="/contact">{data.footerLink3}</a></li>
                <li><a href="/help">{data.footerLink4}</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h4>{data.footerColumnLabel2}</h4>
              <ul>
                <li><a href="/returns">{data.footerLink5}</a></li>
                <li><a href="/follow-order">{data.footerLink6}</a></li>
                <li><a href="/blog">{data.footerLink8}</a></li>
                <li><a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault(); // Empêche le comportement par défaut du lien
                        const badgeImage = document.querySelector("section.badge-container > img");
                        if (badgeImage) {
                          badgeImage.click(); // Simule un clic sur l'image
                        }
                      }}
                    >{data.footerLink7}</a></li>
                
              </ul>
            </div>
            <div className="footer-column">
              <h4>{data.footerColumnLabel3}</h4>
              {submitted ? (
                <p>Thank you for your registration</p>
              ) : (
                <form onSubmit={handleSubmit}> 
                  <label htmlFor="email">{data.footerNewsletter}</label>
                  <input 
                    type="email" 
                    id="email" 
                    name="email" 
                    placeholder={data.footerNewsletterInput}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required 
                  />
                  <button type="submit">{data.footerNewsletterCta}</button>
                </form>
              )}
            </div>
          </article>
          <div className="sub-footer">
            <div className="legal-container">
                <a href="/cgv">{data.footerLegal1}</a>
                <a href="/legals">{data.footerLegal2}</a>
                <a href="/confidentiality">{data.footerLegal3}</a>
              </div>
            <p>© 2025 - {data.footerCopyright} - ManoMano</p>
            <div className={styles.paymentIcons}>
              <img src="/card-logo.png" alt={"acheter" + shop.name} />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};


export default Footer;
