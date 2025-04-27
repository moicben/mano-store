import { useState, useEffect, useRef } from 'react';

import Head from '../components/Head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Products from '../components/Products';
import Reviews from '../components/Reviews';
import Testimonials from 'components/Testimonials';
import ProductInfos from '../components/ProductInfos';

import { fetchData } from '../lib/supabase.mjs';


export default function ProductDetail({ product, shop, data, products, reviews }) {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [visibleImageIndex, setVisibleImageIndex] = useState(0);
    const [buttonText, setButtonText] = useState('Ajouter au panier');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [showBanner, setShowBanner] = useState(false);
    const sliderRef = useRef(null);

    useEffect(() => {
        const timer = setInterval(() => {
            // (Exemple de gestion de timer)
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setShowBanner(window.scrollY > window.innerHeight * 1.2);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    if (!product) {
        return <div>Produit non trouvé</div>;
    }

    const handleAddToCart = async () => {
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        const productIndex = cart.findIndex(item => item.id === product.id);
        if (productIndex !== -1) {
            cart[productIndex].quantity += 1;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem('cart', JSON.stringify(cart));
        setButtonText('Produit ajouté');
        setTimeout(() => setButtonText('Ajouter au panier'), 3000);
        document.querySelector('.cart-container').click();
    };

    const handleImageClick = (index) => {
        setSelectedImageIndex(index);
    };

    const handleNextImages = () => {
        if (visibleImageIndex + 1 < images.length) {
            setVisibleImageIndex(visibleImageIndex + 1);
            setSelectedImageIndex(visibleImageIndex + 1);
        } else {
            setVisibleImageIndex(0);
            setSelectedImageIndex(0);
        }
    };

    const handleMouseMove = (e) => {
        const { left, top, width, height } = e.target.getBoundingClientRect();
        const x = ((e.clientX - left) / width) * 100;
        const y = ((e.clientY - top) / height) * 100;
        setMousePosition({ x, y });
    };

    useEffect(() => {
        const largeImage = document.querySelector('.large-image');
        if (largeImage) {
            largeImage.style.setProperty('--mouse-x', `${mousePosition.x}%`);
            largeImage.style.setProperty('--mouse-y', `${mousePosition.y}%`);
        }
    }, [mousePosition]);

    const images = product.images || [];
    const visibleImages = images.slice(visibleImageIndex, visibleImageIndex + 4);
    if (visibleImages.length < 4) {
        visibleImages.push(...images.slice(0, 4 - visibleImages.length));
    }

    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const openPopup = () => setIsPopupVisible(true);
    const closePopup = () => setIsPopupVisible(false);


    return (
        <div className="container">
            <Head
                name={shop.name}
                domain={shop.domain}
                title={`${product.title} - ${shop.name}`}
                description={product.description}
            />

            <main className="product-page">
                <Header  data={data} shop={shop} reviews={reviews} />

                {isPopupVisible && (
                    <div className="popup-overlay" onClick={closePopup}>
                        <button className="close-popup"><i className="fas fa-times"></i></button>
                        <div className="popup-content" onClick={(e) => e.stopPropagation()}>
                            <img
                                src={images[selectedImageIndex]}
                                alt={product.title}
                                className="popup-image"
                            />
                            <div className="popup-thumbnail-container">
                                {visibleImages.map((image, index) => (
                                    image && (
                                        <img
                                            key={index + visibleImageIndex}
                                            src={image}
                                            alt={`${product.title} ${index + 1}`}
                                            onClick={() => handleImageClick(index + visibleImageIndex)}
                                            className={`thumbnail ${selectedImageIndex === index + visibleImageIndex ? 'selected' : ''}`}
                                        />
                                    )
                                ))}
                                {images.length > 4 && (
                                    <button className="next-button" onClick={handleNextImages}>
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <section className="product-hero">
                    <div className="product-columns">
                        <div className="product-image">
                            {images[selectedImageIndex] && (
                                <img
                                    src={images[selectedImageIndex]}
                                    alt={product.title}
                                    className="large-image"
                                    onMouseMove={handleMouseMove}
                                    onClick={openPopup}
                                />
                            )}
                            <div className="thumbnail-container">
                                {visibleImages.map((image, index) => (
                                    image && (
                                        <img
                                            key={index + visibleImageIndex}
                                            src={image}
                                            alt={`${product.title} ${index + 1}`}
                                            onClick={() => handleImageClick(index + visibleImageIndex)}
                                            className={`thumbnail ${selectedImageIndex === index + visibleImageIndex ? 'selected' : ''}`}
                                        />
                                    )
                                ))}
                                {images.length > 4 && (
                                    <button className="next-button" onClick={handleNextImages}>
                                        <i className="fas fa-chevron-right"></i>
                                    </button>
                                )}
                            </div>
                        </div>
                        <ProductInfos data={data} product={product} handleAddToCart={handleAddToCart} buttonText={buttonText} shop={shop}/>
                    </div>
                </section>

                <section className="product-details">
                    <div className="wrapper" dangerouslySetInnerHTML={{ __html: product.more1 }}/>
                </section>

                <Reviews data={data} />

                <Testimonials data={data} shop={shop} reviews={reviews} />

                <Products
                    products={products}
                    title="Produits similaires"
                    showCategoryFilter={false}
                    data={data}
                    shop={shop}
                />

            </main>

            {showBanner && (
                <div className="cta-banner">
                    <div className="banner-content">
                        <h3>{product.title}</h3>
                        <p className="description">{product.desc}</p>
                        {product.discounted ? (
                            <>
                                <p className="price new color-primary">
                                    {product.price.toFixed(2).replace('.', ',')} {shop.currency}
                                    <span className="initial-price">{product.discounted.toFixed(2).replace('.', ',')} {shop.currency}</span>
                                </p>
                            </>
                        ) : (
                            <p className="price">{product.price.toFixed(2).replace('.', ',')} {shop.currency}</p>
                        )}
                    </div>
                    <article>
                        <span>Promo Début-Mai 15%</span>
                        <button onClick={handleBuyNow}>
                            {data.productBuyFor} {(product.price * 0.85).toFixed(2).replace('.', ',')}{shop.currency}
                        </button>
                    </article>
                </div>
            )}

            <Footer shop={shop} data={data} />
        </div>
    );

    function handleBuyNow() {
        handleAddToCart();
        window.location.href = '/checkout';
    }
}

export async function getStaticPaths() {
    const products = await fetchData('products', { match: { shop_id: process.env.SHOP_ID } });
    if (!products || products.length === 0) {
        console.error("Erreur : aucun produit trouvé.");
        return { paths: [], fallback: false };
    }
    const paths = products.map(product => ({
        params: { slug: product.slug }
    }));
    return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
    const { slug } = params;
    const shopData = await fetchData('shops', { match: { id: process.env.SHOP_ID } });
    const contentData = await fetchData('contents', { match: { shop_id: process.env.SHOP_ID } });
    const products = await fetchData('products', { match: { shop_id: process.env.SHOP_ID } });
    const reviews = await fetchData('reviews', { match: { shop_id: process.env.SHOP_ID } });
    const product = products.find(p => p.slug === slug);
    if (!product) {
        return { notFound: true };
    }
    return {
        props: {
            product,
            products,
            shop: shopData[0],
            data: contentData[0],
            reviews,
        },
    };
}