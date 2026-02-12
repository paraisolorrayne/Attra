interface LocalBusinessSchemaProps {
  locations?: Array<{
    name: string
    streetAddress: string
    addressLocality: string
    addressRegion: string
    postalCode: string
    telephone: string
    latitude: number
    longitude: number
    mapUrl?: string
  }>
}

const defaultLocations = [
  {
    name: 'Attra Veículos - Tibery',
    streetAddress: 'Av. Rondon Pacheco, 4600 - Tibery',
    addressLocality: 'Uberlândia',
    addressRegion: 'MG',
    postalCode: '38408-343',
    telephone: '+55-34-3014-3232',
    latitude: -18.9113,
    longitude: -48.2622,
    mapUrl: 'https://maps.google.com/?q=Attra+Veiculos+Tibery+Uberlandia',
  },
  {
    name: 'Attra Veículos - Santa Mônica',
    streetAddress: 'Av. João Naves de Ávila, 1500 - Santa Mônica',
    addressLocality: 'Uberlândia',
    addressRegion: 'MG',
    postalCode: '38408-343',
    telephone: '+55-34-3226-0202',
    latitude: -18.9186,
    longitude: -48.2772,
    mapUrl: 'https://maps.google.com/?q=Attra+Veiculos+Santa+Monica+Uberlandia',
  },
]

export function LocalBusinessSchema({ locations = defaultLocations }: LocalBusinessSchemaProps) {
  const schemas = locations.map((location) => ({
    '@context': 'https://schema.org',
    '@type': 'AutoDealer',
    name: location.name,
    description: 'Concessionária premium especializada em veículos importados, nacionais, seminovos premium e supercarros em Uberlândia-MG.',
    url: 'https://attraveiculos.com.br',
    logo: 'https://attraveiculos.com.br/images/logo-attra.png',
    image: 'https://attraveiculos.com.br/images/showroom-attra.jpg',
    telephone: location.telephone,
    email: 'faleconosco@attraveiculos.com.br',
    address: {
      '@type': 'PostalAddress',
      streetAddress: location.streetAddress,
      addressLocality: location.addressLocality,
      addressRegion: location.addressRegion,
      postalCode: location.postalCode,
      addressCountry: 'BR',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: location.latitude,
      longitude: location.longitude,
    },
    hasMap: location.mapUrl,
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
    priceRange: '$$$',
    paymentAccepted: 'Cash, Credit Card, Financing',
    currenciesAccepted: 'BRL',
    areaServed: {
      '@type': 'Country',
      name: 'Brazil',
    },
    sameAs: [
      'https://www.instagram.com/attraveiculos',
      'https://www.facebook.com/attraveiculos',
      'https://www.youtube.com/@attraveiculos',
    ],
  }))

  return (
    <>
      {schemas.map((schema, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  )
}

