import Link from 'next/link'
import Image from 'next/image'
import { Calendar, ArrowRight } from 'lucide-react'
import { BlogPostWithExtras } from '@/types'
import { formatDate } from '@/lib/utils'

interface BlogCardProps {
	  post: BlogPostWithExtras
}

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="bg-background-card border border-border rounded-xl overflow-hidden group hover:border-primary transition-colors">
      {/* Cover Image */}
      <Link href={`/blog/${post.slug}`} className="block relative aspect-[16/10] overflow-hidden">
        {post.cover_image ? (
          <Image
            src={post.cover_image}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-background-soft flex items-center justify-center">
            <span className="text-foreground-secondary">Sem imagem</span>
          </div>
        )}
        {/* Category badge */}
        <span className="absolute top-4 left-4 px-3 py-1 bg-primary text-white text-xs font-medium rounded-full">
          {post.category}
        </span>
      </Link>

      {/* Content */}
      <div className="p-6">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm text-foreground-secondary mb-3">
          <Calendar className="w-4 h-4" />
          <time dateTime={post.published_at ?? undefined}>{formatDate(post.published_at ?? post.created_at)}</time>
        </div>

        {/* Title */}
        <h2 className="text-lg font-semibold text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>

        {/* Excerpt */}
        <p className="text-foreground-secondary text-sm line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        {/* Read more */}
        <Link
          href={`/blog/${post.slug}`}
          className="inline-flex items-center text-primary text-sm font-medium hover:gap-2 transition-all"
        >
          Ler mais <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </article>
  )
}

