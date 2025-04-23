import React, { useState, useEffect } from 'react';

import Head from '../components/Head';
import Footer from '../components/Footer';
import Header from '../components/Header';

import Testimonials from 'components/Testimonials';

import { fetchData } from '../lib/supabase'; // Assurez-vous que le chemin est correct

const APropos = ({ data, shop, brand, categories, reviews }) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Vérifiez la taille initiale de l'écran
    handleResize();

    // Ajoutez un écouteur d'événements pour les redimensionnements
    window.addEventListener('resize', handleResize);

    // Nettoyez l'écouteur d'événements 
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="container">

      <Head name={shop.name} domain={shop.domain}
            favicon={brand.favicon} graph={brand.graph}
            colorPrimary={brand.colorPrimary} colorSecondary={brand.colorSecondary} colorBlack={brand.colorBlack} colorGrey={brand.colorGrey} bgMain={brand.bgMain} bgLight={brand.bgLight} bgDark={brand.bgDark} radiusBig={brand.radiusBig} radiusMedium={brand.radiusMedium} font={brand.font} 
            title={`${data.aboutPageLabel} - ${shop.name}`}
      />
      <main>
        <Header logo={brand.logo} categories={categories} data={data} shop={shop} reviews={reviews} />

        <section className="a-propos" id="about">
          <img src={`${isMobile ? data.aboutPageImgMobile : data.aboutPageImg}`} alt={shop.name} className="about-image" />
          {/* <div className='about-banner'>
            <div className='filter'>
              <h1>Il était une fois...</h1>
            </div>
          </div>
          <div className="wrapper">
          </div> */}
        </section>
        <Testimonials data={data} shop={shop} reviews={reviews} />
      </main>
      <Footer shop={shop} data={data} />
    </div>
  );
};

export async function getStaticProps() {
  const data = await fetchData('contents', { match: { shop_id: process.env.SHOP_ID } });
  const shop = await fetchData('shops', { match: { id: process.env.SHOP_ID } });
  const brand = await fetchData('brands', { match: { shop_id: process.env.SHOP_ID } });

  const categories = await fetchData('categories', { match: { shop_id: process.env.SHOP_ID } });
  const reviews = await fetchData('reviews', { match: { shop_id: process.env.SHOP_ID } });

  return {
    props: {
      data: data[0],
      shop: shop[0],
      brand: brand[0],
      categories: categories,
      reviews: reviews,
    },
  };
}

export default APropos;