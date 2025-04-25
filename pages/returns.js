import React from 'react';
import Head from '../components/Head';

import Header from '../components/Header';
import Footer from '../components/Footer';

import { fetchData } from 'lib/supabase';


const PolitiqueDesRetours = ({shop, categories, data, reviews}) => {
  return (

    <div className="container">
      <Head name={shop.name} domain={shop.domain}
            
            title={`${data.returnsPageLabel} - ${shop.name}`}
      />
      
      <main >
        <Header  categories={categories} data={data} shop={shop} reviews={reviews} />

    
      <section className='legal'> 
        <h1>{data.returnsPageLabel}</h1>
        <div dangerouslySetInnerHTML={{ __html: data.returnsPageContent }}></div>
      </section>
      </main>
      <Footer shop={shop} data={data} />
    </div>
  );
};

export default PolitiqueDesRetours;


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
