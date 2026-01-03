/**
 * WordPress Blog Import Script
 *
 * This script parses the WordPress XML export and converts posts to the DualBlogPost format.
 * Run with: npx ts-node scripts/import-wordpress-blog.ts
 */

import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

interface WordPressPost {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  date: string
  author: string
  status: string
  featuredImage?: string
  images: string[]
}

interface ImportedPost {
  id: string
  post_type: 'educativo' | 'car_review'
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image: string
  featured_image_alt: string
  author: {
    name: string
    bio: string
    avatar?: string
  }
  published_date: string
  reading_time: string
  is_published: boolean
  educativo?: {
    category: string
    topic: string
    seo_keyword: string
  }
  car_review?: {
    brand: string
    model: string
    year: number
    specs: {
      engine: string
      power: string
      torque: string
      acceleration: string
      top_speed: string
      transmission: string
    }
    gallery_images: string[]
    availability: {
      in_stock: boolean
      price: string
      stock_url: string
    }
  }
  seo: {
    meta_title: string
    meta_description: string
    keywords: string[]
  }
}

// Parse XML content using regex (simple approach for WordPress export)
function extractCDATA(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function extractTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}>([^<]*)</${tag}>`, 'i')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

function extractImages(content: string): string[] {
  const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi
  const images: string[] = []
  let match
  while ((match = imgRegex.exec(content)) !== null) {
    if (match[1] && !match[1].includes('svg')) {
      images.push(match[1])
    }
  }
  return images
}

function cleanHtmlContent(html: string): string {
  // Remove DOCTYPE, html, head, body tags and styles
  let content = html
    .replace(/<!DOCTYPE[^>]*>/gi, '')
    .replace(/<html[^>]*>/gi, '')
    .replace(/<\/html>/gi, '')
    .replace(/<head>[\s\S]*?<\/head>/gi, '')
    .replace(/<body[^>]*>/gi, '')
    .replace(/<\/body>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
    .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
    .replace(/style="[^"]*"/gi, '')
    .replace(/class="[^"]*"/gi, '')
    
  // Keep only the main content tags
  const mainMatch = content.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
  if (mainMatch) {
    content = mainMatch[1]
  }
  
  return content.trim()
}

function calculateReadingTime(content: string): string {
  const text = content.replace(/<[^>]*>/g, '')
  const words = text.split(/\s+/).length
  const minutes = Math.ceil(words / 200)
  return `${minutes} min`
}

function generateExcerpt(content: string, maxLength = 200): string {
  const text = content.replace(/<[^>]*>/g, '').trim()
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).replace(/\s+\S*$/, '') + '...'
}

function detectBrandFromTitle(title: string): { brand: string; model: string } | null {
  const brands = [
    'Ferrari', 'Porsche', 'Lamborghini', 'McLaren', 'Aston Martin', 'Bentley',
    'Mercedes-Benz', 'BMW', 'Audi', 'Range Rover', 'Land Rover', 'Volvo',
    'Hummer', 'GMC', 'Maserati', 'Rolls-Royce', 'Jaguar', 'Alfa Romeo'
  ]
  
  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      // Try to extract model from title
      const titleAfterBrand = title.substring(title.toLowerCase().indexOf(brand.toLowerCase()) + brand.length)
      const modelMatch = titleAfterBrand.match(/^\s*([A-Z0-9][A-Za-z0-9\s\-]+?)(?:\s*[-:|]|$)/i)
      const model = modelMatch ? modelMatch[1].trim() : ''
      return { brand, model }
    }
  }
  return null
}

function parseWordPressXML(xmlPath: string): WordPressPost[] {
  const xml = fs.readFileSync(xmlPath, 'utf-8')
  const posts: WordPressPost[] = []

  // Split by <item> tags
  const items = xml.split(/<item>/).slice(1)

  for (const item of items) {
    const postType = extractCDATA(item, 'wp:post_type')
    const status = extractCDATA(item, 'wp:status')

    // Only process published posts
    if (postType !== 'post' || status !== 'publish') continue

    const title = extractCDATA(item, 'title')
    const slug = extractCDATA(item, 'wp:post_name')
    const content = extractCDATA(item, 'content:encoded')
    const date = extractCDATA(item, 'wp:post_date')
    const author = extractCDATA(item, 'dc:creator')
    const id = extractTag(item, 'wp:post_id')

    const images = extractImages(content)
    const cleanContent = cleanHtmlContent(content)

    posts.push({
      id,
      title,
      slug,
      content: cleanContent,
      excerpt: generateExcerpt(cleanContent),
      date,
      author,
      status,
      featuredImage: images[0],
      images
    })
  }

  return posts
}

function convertToImportedPost(wpPost: WordPressPost, index: number): ImportedPost {
  const brandInfo = detectBrandFromTitle(wpPost.title)
  const isCarReview = brandInfo !== null

  // Format date to YYYY-MM-DD
  const dateMatch = wpPost.date.match(/(\d{4}-\d{2}-\d{2})/)
  const formattedDate = dateMatch ? dateMatch[1] : new Date().toISOString().split('T')[0]

  // Extract year from title if present
  const yearMatch = wpPost.title.match(/\b(20\d{2}|19\d{2})\b/)
  const year = yearMatch ? parseInt(yearMatch[1]) : new Date().getFullYear()

  const basePost: ImportedPost = {
    id: `wp-${wpPost.id}`,
    post_type: isCarReview ? 'car_review' : 'educativo',
    title: wpPost.title,
    slug: wpPost.slug,
    excerpt: wpPost.excerpt,
    content: wpPost.content,
    featured_image: wpPost.featuredImage || '/images/blog/default-cover.jpg',
    featured_image_alt: wpPost.title,
    author: {
      name: wpPost.author || 'Equipe Attra',
      bio: 'Especialistas em veículos premium'
    },
    published_date: formattedDate,
    reading_time: calculateReadingTime(wpPost.content),
    is_published: true,
    seo: {
      meta_title: `${wpPost.title} | Blog Attra`,
      meta_description: wpPost.excerpt.substring(0, 160),
      keywords: extractKeywords(wpPost.title, wpPost.content)
    }
  }

  if (isCarReview && brandInfo) {
    basePost.car_review = {
      brand: brandInfo.brand,
      model: brandInfo.model,
      year,
      specs: {
        engine: 'Consultar',
        power: 'Consultar',
        torque: 'Consultar',
        acceleration: 'Consultar',
        top_speed: 'Consultar',
        transmission: 'Consultar'
      },
      gallery_images: wpPost.images.slice(0, 5),
      availability: {
        in_stock: false,
        price: 'Sob consulta',
        stock_url: `/estoque?marca=${brandInfo.brand.toLowerCase()}`
      }
    }
  } else {
    basePost.educativo = {
      category: 'Veículos',
      topic: 'Análise',
      seo_keyword: wpPost.title.toLowerCase().split(' ').slice(0, 3).join(' ')
    }
  }

  return basePost
}

function extractKeywords(title: string, content: string): string[] {
  const keywords: string[] = []
  const brands = ['Ferrari', 'Porsche', 'Lamborghini', 'McLaren', 'Aston Martin',
                  'Mercedes-Benz', 'BMW', 'Audi', 'Range Rover', 'Hummer']

  for (const brand of brands) {
    if (title.toLowerCase().includes(brand.toLowerCase())) {
      keywords.push(brand)
    }
  }

  // Add generic keywords
  keywords.push('carros de luxo', 'superesportivos', 'Attra Veículos')

  return keywords
}

function main() {
  const xmlPath = path.resolve(__dirname, '../src/resources/blog-old/attra.WordPress.2026-01-02.xml')

  console.log('🚗 Starting WordPress blog import...')
  console.log(`📂 Reading XML from: ${xmlPath}`)

  const wpPosts = parseWordPressXML(xmlPath)
  console.log(`📝 Found ${wpPosts.length} published posts`)

  const importedPosts = wpPosts.map((post, index) => convertToImportedPost(post, index))

  // Generate TypeScript file with imported posts
  const outputPath = path.resolve(__dirname, '../src/lib/imported-blog-posts.ts')

  // Use proper JSON format to avoid string escaping issues
  const tsContent = `// Auto-generated from WordPress import on ${new Date().toISOString()}
// DO NOT EDIT MANUALLY - Regenerate using: npx ts-node scripts/import-wordpress-blog.ts

import type { DualBlogPost } from '@/types'

export const importedBlogPosts: DualBlogPost[] = ${JSON.stringify(importedPosts, null, 2)}
`

  fs.writeFileSync(outputPath, tsContent, 'utf-8')
  console.log(`✅ Generated ${importedPosts.length} posts to: ${outputPath}`)

  // Summary
  const carReviews = importedPosts.filter(p => p.post_type === 'car_review')
  const educativos = importedPosts.filter(p => p.post_type === 'educativo')

  console.log('\n📊 Summary:')
  console.log(`   - Car Reviews: ${carReviews.length}`)
  console.log(`   - Educativo/General: ${educativos.length}`)
  console.log('\n🎉 Import complete!')
}

main()

