export function OrganizationSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: 'Attra Veículos',
    description: 'Referência em veículos premium, importados e supercarros em Uberlândia e Minas Gerais. Atendimento nacional.',
    url: 'https://attraveiculos.com.br',
    logo: 'https://attraveiculos.com.br/logo.png',
    image: 'https://attraveiculos.com.br/showroom.jpg',
    telephone: '+55-34-3014-3232',
    email: 'faleconosco@attraveiculos.com.br',
    address: [
      {
        '@type': 'PostalAddress',
        streetAddress: 'Av. Rondon Pacheco, 4600 - Tibery',
        addressLocality: 'Uberlândia',
        addressRegion: 'MG',
        postalCode: '38408-343',
        addressCountry: 'BR',
      },
      {
        '@type': 'PostalAddress',
        streetAddress: 'Av. João Naves de Ávila, 1500 - Santa Mônica',
        addressLocality: 'Uberlândia',
        addressRegion: 'MG',
        postalCode: '38408-343',
        addressCountry: 'BR',
      },
    ],
    geo: {
      '@type': 'GeoCoordinates',
      latitude: -18.9113,
      longitude: -48.2622,
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Saturday',
        opens: '08:00',
        closes: '13:00',
      },
    ],
    sameAs: [
      'https://www.instagram.com/attraveiculos',
      'https://www.facebook.com/attraveiculos',
      'https://www.youtube.com/@attraveiculos',
    ],
    priceRange: '$$$',
    areaServed: {
      '@type': 'Country',
      name: 'Brazil',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Veículos Premium',
      itemListElement: [
        { '@type': 'OfferCatalog', name: 'Esportivos' },
        { '@type': 'OfferCatalog', name: 'SUVs' },
        { '@type': 'OfferCatalog', name: 'Sedãs de Luxo' },
        { '@type': 'OfferCatalog', name: 'Supercarros' },
      ],
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

