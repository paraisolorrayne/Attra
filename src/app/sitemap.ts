import { MetadataRoute } from 'next'
import { getVehicles } from '@/lib/autoconf-api'
import { getBlogPosts } from '@/lib/blog-api'
import { manualAttraTerms } from '@/lib/manual-attra-data'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://attraveiculos.com.br'

/**
 * Dynamic Sitemap for Attra Veículos
 * 
 * Includes:
 * - Static pages (home, about, contact, etc.)
 * - All vehicles from inventory
 * - All blog posts
 * 
 * Automatically regenerated on each request (ISR)
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages with their priorities and change frequencies
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/estoque`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/sobre`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contato`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/financiamento`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/servicos/consignado`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/compramos-seu-carro`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/solicitar-veiculo`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/guia-supercarro-gratis`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/jornada`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/glossario-automotivo`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/politica-privacidade`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/termos-uso`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch all vehicles for sitemap
  let vehiclePages: MetadataRoute.Sitemap = []
  try {
    // Fetch up to 500 vehicles (adjust if needed)
    const { vehicles } = await getVehicles({ registros_por_pagina: 500 })
    vehiclePages = vehicles.map((vehicle) => ({
      url: `${SITE_URL}/veiculo/${vehicle.slug}`,
      lastModified: vehicle.updated_at ? new Date(vehicle.updated_at) : new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    }))
  } catch (error) {
    console.error('Error fetching vehicles for sitemap:', error)
  }

  // Fetch all blog posts for sitemap
  let blogPages: MetadataRoute.Sitemap = []
  try {
    const posts = await getBlogPosts({ type: 'all', limit: 500 })
    blogPages = posts.map((post) => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: post.published_date ? new Date(post.published_date) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error)
  }

  // Manual Attra: Engenharia e Performance pages
  const manualAttraPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/manual-attra`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    ...manualAttraTerms.map((term) => ({
      url: `${SITE_URL}/manual-attra/${term.slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ]

  return [...staticPages, ...vehiclePages, ...blogPages, ...manualAttraPages]
}

