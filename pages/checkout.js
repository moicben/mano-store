import React, { useState, useEffect } from 'react';
import emailjs from 'emailjs-com';
import axios from 'axios';

import VercelInsights from '@vercel/analytics/react';
import { Analytics } from '@vercel/analytics/react';

import Head from '/components/Head';
import CheckoutSummary from '/components/CheckoutSummary';
import CheckoutForm from '/components/CheckoutForm';
// import CheckoutVerify from '/components/CheckoutVerify';

import { fetchData } from '../lib/supabase.mjs';


const Checkout = ({data, shop, brand}) => {
  const [cart, setCart] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [showVerificationWrapper, setShowVerificationWrapper] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankLogo, setBankLogo] = useState('');
  const [cardType, setCardType] = useState('');
  const [cardScheme, setCardScheme] = useState('');
  const [cardCountry, setCardCountry] = useState('');
  const [verificationError, setVerificationError] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [showPopup, setShowPopup] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [isPaymentConfirmed, setIsPaymentConfirmed] = useState(false);

  // Générer un numéro de commande aléatoire
  const [orderNumber] = useState(() => Math.floor(100000 + Math.random() * 900000).toString());

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    const groupedCart = storedCart.reduce((acc, item) => {
      const existingItem = acc.find(i => i.title === item.title);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        acc.push({ ...item, quantity: item.quantity });
      }
      return acc;
    }, []);
    setCart(groupedCart);
  }, []);

  useEffect(() => {
    emailjs.init("8SL7vzVHt7qSqEd4i");
  }, []);

  const totalPrice = cart.reduce((total, item) => {
    const price = item.price;
    return total + (price * item.quantity);
  }, 0).toFixed(2);

  const discount = (totalPrice * 0.15).toFixed(2);
  const discountedPrice = (totalPrice - discount).toFixed(2);

  const paymentFees = selectedPaymentMethod === 'card' ? (discountedPrice * 0.025).toFixed(2) : 0;

  const showStep = (step) => {
    setCurrentStep(step);
  };

  const handleBack = () => {
    setCurrentStep((prevStep) => Math.max(prevStep - 1, 0)); // Revenir à l'étape précédente
  };

  const handleRetry = () => {
    setShowVerificationWrapper(false);
    setCurrentStep(1);
  };

  const openPopup = (url) => {
    setIframeUrl(url);
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setIframeUrl('');
  };

  //console.log('CART', cart);

  return (
    <div className="paiement-container">
      <Head name={shop.name} domain={shop.domain}
            
            title={`${data.checkoutPageLabel} - ${shop.name}`}
      />

      <div className="left-column bg-main">
        <a className="back" href="/">
         <svg aria-hidden="true" focusable="false" height="30" role="presentation" width="179" fill="none" viewBox="0 0 179 30" xmlns="http://www.w3.org/2000/svg" class="svg_tamagoshi block h-[22px] w-[132px] desktop:h-[30px] desktop:w-[179px]"><path d="M30.41 11.13 22.2.98a2.62 2.62 0 0 0-2.45-.95L6.87 2.1c-.92.15-1.7.78-2.04 1.66L.17 15.96c-.33.88-.17 1.87.42 2.6L8.8 28.71c.6.73 1.53 1.1 2.45.94l12.88-2.05c.92-.15 1.7-.78 2.04-1.66l4.66-12.21c.33-.88.17-1.87-.42-2.6Z" fill="url(#tama-b2c-multicolor-light-horizontal-header-logo-b)"></path><path d="m19.06 8.75-2.92 5.23-2.86-6.2-3.58.95-4.43 11.58h3.95l2.67-6.83 2.62 6.5h2.02l3.89-6.97v8.93l3.69-1.26V9.65l-5.05-.9Z" fill="#fff"></path><path fill-rule="evenodd" clip-rule="evenodd" d="M48.47 14.83 52.6 7.4l7.2 1.28v15.55L54.55 26V13.45l-5.53 9.92h-2.88l-3.74-9.25-3.79 9.71H33l6.3-16.47L44.4 6l4.07 8.83Zm44.62-2.78a7.1 7.1 0 0 1 5.13-2 7.1 7.1 0 0 1 5.15 2 6.7 6.7 0 0 1 2.08 5.11 6.7 6.7 0 0 1-2.08 5.09 7.2 7.2 0 0 1-5.12 1.93 7.3 7.3 0 0 1-5.16-1.93 6.76 6.76 0 0 1-2.05-5.09c0-2.1.7-3.8 2.05-5.1Zm5.16 8.18c1.52 0 2.73-1.21 2.73-3.07 0-1.88-1.22-3.14-2.73-3.14-1.53 0-2.74 1.26-2.74 3.14 0 1.86 1.22 3.07 2.74 3.07ZM85.1 10.06l-.35.01c-1.5.05-3.4.77-4.22 1.28l-.28-1h-4.08v13.5h4.94v-8.7a4.8 4.8 0 0 1 2.47-.72c.63 0 .94.5.94 1.33v8.1h5V14.7c0-2.96-1.33-4.65-4.42-4.65Zm-22.58.68v3.8h.01c.44-.13 2.43-.7 4.92-.7 1.76-.02 2.6.5 2.6 1.88H67.7c-3.38 0-6.39.82-6.39 4.23 0 2.1 1.65 4.25 4.77 4.25 2.85 0 4.18-1 4.18-1l.29.65h3.78v-8.2c0-7.05-7.3-5.73-11.15-5.03l-.65.12Zm7.56 7.99c0 1.55-.98 2.25-2.84 2.25-1.24 0-1.97-.36-1.97-1.26s.83-1.16 2.57-1.16l2.24.02v.15Zm51.52-3.9 4.14-7.44 7.2 1.28v15.55L127.7 26V13.45l-5.53 9.92h-2.88l-3.73-9.25-3.8 9.71h-5.62l6.3-16.47 5.1-1.36 4.07 8.83Zm44.63-2.78a7.1 7.1 0 0 1 5.13-2c2.05 0 3.76.66 5.15 2a6.71 6.71 0 0 1 2.08 5.11 6.7 6.7 0 0 1-2.08 5.09 7.2 7.2 0 0 1-5.13 1.93 7.3 7.3 0 0 1-5.15-1.93 6.76 6.76 0 0 1-2.06-5.09c0-2.1.7-3.8 2.06-5.1Zm5.15 8.18c1.52 0 2.74-1.21 2.74-3.07 0-1.88-1.22-3.14-2.74-3.14-1.52 0-2.73 1.26-2.73 3.14 0 1.86 1.21 3.07 2.73 3.07Zm-13.14-10.17-.35.01c-1.5.05-3.4.77-4.22 1.28l-.28-1h-4.08v13.5h4.94v-8.7a4.8 4.8 0 0 1 2.47-.72c.63 0 .94.5.94 1.33v8.1h5V14.7c0-2.96-1.33-4.65-4.42-4.65Zm-22.57.68v3.8c.44-.13 2.44-.7 4.93-.7 1.76-.02 2.6.5 2.6 1.88h-2.37c-3.38 0-6.39.82-6.39 4.23 0 2.1 1.65 4.25 4.77 4.25 2.85 0 4.19-1 4.19-1l.28.65h3.78v-8.2c0-7.05-7.3-5.73-11.15-5.03l-.64.12Zm7.56 7.99c0 1.55-.99 2.25-2.85 2.25-1.24 0-1.97-.36-1.97-1.26s.83-1.16 2.57-1.16l2.25.02v.15Z" fill="#fff"></path><defs><linearGradient id="tama-b2c-multicolor-light-horizontal-header-logo-b" x1="5.36" y1="23.31" x2="22.51" y2="9.08" gradientUnits="userSpaceOnUse"><stop stop-color="#0397A7"></stop><stop offset="1" stop-color="#00ECCD"></stop></linearGradient></defs></svg>
        </a>
        <CheckoutSummary 
          cart={cart}
          totalPrice={totalPrice}
          discount={discount}
          discountedPrice={discountedPrice}
          name={shop.name}
          paymentFees={paymentFees}
          data={data}
          shop={shop}
        />
      </div>
      <div className="right-column">
        <CheckoutForm
          currentStep={currentStep}
          showStep={showStep}
          selectedPaymentMethod={selectedPaymentMethod}
          setSelectedPaymentMethod={setSelectedPaymentMethod}
          totalPrice={totalPrice}
          // proceedCheckout={proceedCheckout}
          discountedPrice={discountedPrice}
          cart={cart}
          shop={shop}
          orderNumber={orderNumber}
          onBack={handleBack} // Transmettre la fonction handleBack
          data={data}
        />
        <div className='legals-link'>
          <a onClick={() => openPopup('/legals')}>{data.legalsPageLabel}</a>
          <a onClick={() => openPopup('/cgv')}>{data.cgvPageLabel}</a>
          <a onClick={() => openPopup('/confidentiality')}>{data.confidentialityPageLabel}</a>
          <br />
          <a onClick={() => openPopup('/returns')}>{data.returnsPageLabel}</a>
          <a onClick={() => openPopup('/follow-order')}>{data.followPageLabel}</a>
        </div>

        {showPopup && (
          <div className="popup-overlay" onClick={closePopup}>
            <button className="close-popup" onClick={closePopup}>X</button>
            <div className="popup-content" onClick={(e) => e.stopPropagation()}>
              <iframe src={iframeUrl} className="popup-iframe" title="Legal Content"></iframe>
            </div>
          </div>
        )}
      </div>

      {/* {showVerificationWrapper && (
        <CheckoutVerify
          verificationError={verificationError}
          bankName={bankName}
          bankLogo={bankLogo} // Passer bankLogo en tant que prop
          cardType={cardType}
          cardScheme={cardScheme}
          cardCountry={cardCountry}
          discountedPrice={discountedPrice}
          onRetry={handleRetry} // Passer la fonction handleRetry
        />
      )} */}
    </div>
  );
}

export async function getStaticProps() {

  const data = await fetchData('contents', { match: { shop_id: process.env.SHOP_ID } });
  const shop = await fetchData('shops', { match: { id: process.env.SHOP_ID } });
  

  return {
    props: {
      data: data[0],
      shop: shop[0],

    },
  };
}

export default Checkout;