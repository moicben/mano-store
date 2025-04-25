import React, { useState, useRef } from 'react';
import { fr } from 'date-fns/locale';
import Pagination from './Pagination'; // Import du composant Pagination

const Products = ({ title, products, description, disablePagination = false, categories, data, shop }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [hoveredProduct, setHoveredProduct] = useState(null);
    const productsPerPage = 15;
    const productListRef = useRef(null);

    // La création du dictionnaire des slugs des catégories a été supprimée

    // Filtrer simplement les produits avec le shop.id courant
    const filteredProducts = products.filter(product => product.shop_id === shop.id);
    console.log('Products for shop.id:', shop.id, filteredProducts);

    // Pagination (sans tri ni filtre additionnel)
    const indexOfLastProduct = currentPage * productsPerPage;
    const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
    const currentProducts = disablePagination ? filteredProducts : filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        window.scrollTo({
            top: productListRef.current.offsetTop - 100,
            behavior: 'smooth'
        });
    };

    const getDeliveryDate = (deliveryType) => {
        const today = new Date();
        let deliveryDays;
        if (deliveryType === 'Express') {
            deliveryDays = 2;
        } else if (deliveryType === 'Fast') {
            deliveryDays = 3;
        } else if (deliveryType === 'Normal') {
            deliveryDays = 4;
        } else {
            return '';
        }
        // La logique de calcul de date de livraison est à compléter si nécessaire
        const deliveryDate = new Date(today.getTime() + deliveryDays * 24 * 60 * 60 * 1000);
        return `${deliveryDate.toLocaleDateString('fr-FR', { weekday: 'long', month: 'long', day: 'numeric' })} ${deliveryDate.getFullYear()}`;
    };

    return (
        <section className="products" id='catalogue'>
            <div className='wrapper'>
                {title && <h2>{title}</h2>}
                <div className='product-filters'>
                    {/* Filtres supprimés */}
                </div>
                <div className="product-list" ref={productListRef}>
                    {currentProducts.map(product => {
                        // Utilisation de product.category_slug avec une valeur par défaut basée sur product.category_id si manquant
                        const categorySlug = product.category_slug || `cat-${product.category_id}`;
                        return (
                            <a
                                href={`/${product.slug}`}
                                key={product.id}
                                className={`product-item ${product.bestseller ? 'best-seller' : ''}`}
                                onMouseEnter={() => setHoveredProduct(product.slug)}
                                onMouseLeave={() => setHoveredProduct(null)}
                            >
                                <span className='best-wrap bg-main color-primary'>🏆 {data.productBestsellerLabel}</span>
                                <img
                                    src={
                                        hoveredProduct === product.slug && product.images?.[1]
                                            ? product.images[1]
                                            : product.images?.[0]
                                    }
                                    alt={product.title}
                                />
                                <h3>{product.title}</h3>
                                <p className={`stock ${product.stock.startsWith(data.productStockLowLabel) ? 'low' : ''}`}>
                                    <span>⋅</span>{product.stock}
                                </p>
                                <p className='delivery'>Livraison estimée : {getDeliveryDate(product.delivery)}</p>
                                <p className='price'></p>
                                <p>
                                    {product.discounted ? (
                                        <>
                                            <span className='initial-price'>
                                                {product.discounted.toLocaleString(shop.language, { minimumFractionDigits: 2 })}
                                                {shop.currency}
                                            </span>
                                            <span className='new-price color-primary'>
                                                {product.price.toLocaleString(shop.language, { minimumFractionDigits: 2 })}
                                                {shop.currency}
                                            </span>
                                        </>
                                    ) : (
                                        `${product.price.toLocaleString(shop.language, { minimumFractionDigits: 2 })}${shop.currency}`
                                    )}
                                </p>
                            </a>
                        );
                    })}
                </div>
                {!disablePagination && filteredProducts.length > productsPerPage && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>
        </section>
    );
};

export default Products;