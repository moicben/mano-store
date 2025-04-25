import React, { useState, useRef, useEffect } from 'react';
import { FaShoppingCart } from 'react-icons/fa';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Products from '../components/Products'; 
import Testimonials from '../components/Testimonials';
import Head from '../components/Head';

import { fetchData }  from '../lib/supabase'; // Assurez-vous que le chemin est correct
import { da } from 'date-fns/locale';

const Home = ({ data, shop, products, reviews }) => {
  const [cartCount, setCartCount] = useState(0);
  const videoRef = useRef(null);

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartCount(storedCart.length);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.66; // Réglez la vitesse (0.5 = 50% de la vitesse normale)
    }
  }, []);

  console.log('Shop logo:', shop.logo);

  return (
    <div className="container">
      <Head name={shop.name} domain={shop.domain}
            title={`${shop.name} - ${data.heroTitle}`}
      /> 
      
      <main>
        <Header data={data} shop={shop} reviews={reviews} />
        
        <section className="hero">
          <h1>{data.heroTitle}</h1>
          <h3>{data.heroDesc}</h3>
          <div className='filter'></div>
          <img src={data.heroMedia} alt="Hero" className="hero-image" />
        </section>

 
        <Products 
          products={products} 
          data={data}
          shop={shop}
        />
        
        <Testimonials data={data} shop={shop} reviews={reviews}/>

        
        
      </main>

      <Footer shop={shop} data={data} />
    </div>
  );
};

export async function getStaticProps() {

  const data = await fetchData('contents', { match: { shop_id: process.env.SHOP_ID } });
  const shop = await fetchData('shops', { match: { id: process.env.SHOP_ID } });

  const products = await fetchData('products', { match: { shop_id: process.env.SHOP_ID } });
  const reviews = await fetchData('reviews', { match: { shop_id: process.env.SHOP_ID } });

  return {
    props: {
      data: data[0],
      shop: shop[0],
      products: products,
      reviews: reviews,
    },
  };
}

export default Home;