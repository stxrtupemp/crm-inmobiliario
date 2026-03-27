import { Helmet } from 'react-helmet-async';

const SITE_NAME    = 'CRM Inmobiliario';
const SITE_URL     = import.meta.env['VITE_PUBLIC_URL'] ?? 'https://crminmobiliario.es';
const DEFAULT_IMG  = `${SITE_URL}/og-default.jpg`;
const DESCRIPTION  = 'Tu agencia inmobiliaria de confianza. Viviendas en venta y alquiler en las mejores ubicaciones.';

interface SEOProps {
  title?:       string;
  description?: string;
  image?:       string;
  url?:         string;
  type?:        'website' | 'article';
  noIndex?:     boolean;
}

export function SEO({
  title,
  description = DESCRIPTION,
  image       = DEFAULT_IMG,
  url,
  type        = 'website',
  noIndex     = false,
}: SEOProps) {
  const fullTitle   = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const canonicalUrl = url ? `${SITE_URL}${url}` : SITE_URL;

  return (
    <Helmet>
      {/* Primary */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image"       content={image} />
      <meta property="og:url"         content={canonicalUrl} />
      <meta property="og:locale"      content="es_ES" />

      {/* Twitter / X */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image"       content={image} />
    </Helmet>
  );
}
