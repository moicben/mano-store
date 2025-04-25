import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Head from 'components/Head';
import { fetchData } from 'lib/supabase';

export default function Verification({shop}) {
  const router = useRouter();
  const { orderNumber } = router.query; // Récupère le numéro de commande depuis l'URL
  const [status, setStatus] = useState('pending'); // Statut initial

    useEffect(() => {
    if (!orderNumber) return; // Attendre que `orderNumber` soit disponible
  
    const checkOrderStatus = async () => {
      try {
        const response = await fetch(`/api/get-order-status?orderNumber=${orderNumber}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();
  
        if (data.status === 'paid') {
          router.push(`/confirmation?commande=${orderNumber}`);
        } else if (data.status === 'failed') {
          router.push(`/checkout?failed=true`);
        } else {
          console.log(`Statut actuel: ${data.status}`);
          setStatus(data.status); // Met à jour le statut affiché
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
      }
    };
  
    const interval = setInterval(checkOrderStatus, 5000); // Vérifie toutes les 5 secondes
    return () => clearInterval(interval); // Nettoie l'intervalle lors du démontage du composant
  }, [orderNumber, router]);

  return (
    <div className="confirmation-container">
      <Head name={shop.name} domain={shop.domain}
            
            title={`Confirmation - ${shop.name}`}
      />

      <img src={brand.logo} alt="Logo" className="logo" />
      <h2>Vérification du paiement</h2>
      <p>Nous vérifions votre paiement, cela peut prendre quelques minutes.</p>
      <p>Statut actuel : {status}</p>
      <div className="loader border-top-primary"></div>
    </div>
  );
}

export async function getStaticProps() {
  
  const shop = await fetchData('shops', { match: { id: process.env.SHOP_ID } });

  return {
    props: {

      shop: shop[0],
    },
  };
}