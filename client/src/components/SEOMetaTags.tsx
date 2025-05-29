import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOMetaTagsProps {
  title: string;
  description: string;
  keywords: string;
  type?: 'website' | 'article' | 'LocalBusiness';
  imageUrl?: string;
  publishedDate?: string;
  modifiedDate?: string;
  authorName?: string;
  organizationSchema?: boolean;
  localBusinessSchema?: boolean;
  articleSchema?: boolean;
}

export default function SEOMetaTags({
  title,
  description,
  keywords,
  type = 'website',
  imageUrl = 'https://estilointerior.com/images/og-image.jpg',
  publishedDate,
  modifiedDate,
  authorName,
  organizationSchema = true,
  localBusinessSchema = false,
  articleSchema = false
}: SEOMetaTagsProps) {
  const baseSchema = {
    "@context": "https://schema.org",
  };

  const organizationSchemaData = {
    ...baseSchema,
    "@type": "Organization",
    "name": "Estilo Interior",
    "url": "https://estilointerior.com",
    "logo": "https://estilointerior.com/images/logo.png",
    "sameAs": [
      "https://facebook.com/estilointerior",
      "https://instagram.com/estilointerior",
      "https://linkedin.com/company/estilointerior"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+91-9880652548",
      "contactType": "customer service",
      "areaServed": "Bangalore",
      "availableLanguage": ["English", "Hindi", "Kannada"]
    }
  };

  const localBusinessSchemaData = {
    ...baseSchema,
    "@type": "InteriorDesigner",
    "name": "Estilo Interior",
    "image": "https://estilointerior.com/images/studio.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "100 Feet Road",
      "addressLocality": "Indiranagar",
      "addressRegion": "Karnataka",
      "postalCode": "560038",
      "addressCountry": "IN"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 12.9716,
      "longitude": 77.6441
    },
    "url": "https://estilointerior.com",
    "telephone": "+91-9880652548",
    "priceRange": "₹₹₹",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday"
      ],
      "opens": "10:00",
      "closes": "19:00"
    }
  };

  const articleSchemaData = publishedDate ? {
    ...baseSchema,
    "@type": "Article",
    "headline": title,
    "image": imageUrl,
    "author": {
      "@type": "Person",
      "name": authorName || "Estilo Interior Team"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Estilo Interior",
      "logo": {
        "@type": "ImageObject",
        "url": "https://estilointerior.com/images/logo.png"
      }
    },
    "datePublished": publishedDate,
    "dateModified": modifiedDate || publishedDate,
    "description": description
  } : null;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />

      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:site_name" content="Estilo Interior" />

      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />

      {/* Geo Tags */}
      <meta name="geo.region" content="IN-KA" />
      <meta name="geo.placename" content="Bangalore" />
      <meta name="geo.position" content="12.9716;77.6441" />
      <meta name="ICBM" content="12.9716, 77.6441" />

      {/* Google Search Console Verification - Multiple Methods */}
      <meta name="google-site-verification" content="M_8hgUFXDzI6SNbTzH_ALvab5kZ_GOYdOaTfz-h6A2c" />
      <link rel="dns-prefetch" href="https://www.google.com" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.google-analytics.com" />
      <link rel="preconnect" href="https://www.googletagmanager.com" />

      {/* Structured Data */}
      {organizationSchema && (
        <script type="application/ld+json">
          {JSON.stringify(organizationSchemaData)}
        </script>
      )}

      {localBusinessSchema && (
        <script type="application/ld+json">
          {JSON.stringify(localBusinessSchemaData)}
        </script>
      )}

      {articleSchema && articleSchemaData && (
        <script type="application/ld+json">
          {JSON.stringify(articleSchemaData)}
        </script>
      )}
    </Helmet>
  );
} 