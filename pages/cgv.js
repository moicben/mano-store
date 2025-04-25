
import React from 'react';
import Head from '../components/Head';
import { FaShoppingCart } from 'react-icons/fa';

import Header from '../components/Header';
import Footer from '../components/Footer';

import { fetchData } from 'lib/supabase';

export default function ConditionsGenerales({shop, categories, data, reviews}) {
  return (
    <div className="container">
      <Head name={shop.name} domain={shop.domain}
            
            title={`${data.cgvPageLabel} - ${shop.name}`}
      />

      <main>
        <Header  categories={categories} data={data} shop={shop} reviews={reviews} />
        
        <section className='legal'>
          <h1>{data.cgvPageLabel}</h1>
          <div dangerouslySetInnerHTML={{ __html: data.cgvPageContent }}></div>
        </section>
      </main>
      <Footer shop={shop} data={data} />
    </div>
  )
}


export async function getStaticProps() {
  const shop = await fetchData('shops', { match: { id: process.env.SHOP_ID } });
  
  const categories = await fetchData('categories', { match: { shop_id: process.env.SHOP_ID } });
  const data = await fetchData('contents', { match: { shop_id: process.env.SHOP_ID } });
  const reviews = await fetchData('reviews', { match: { shop_id: process.env.SHOP_ID } });

  return {
    props: {
      shop: shop[0],

      categories: categories,
      data: data[0],
      reviews: reviews,
    },
  };
}