#!/usr/bin/env node
/**
 * Blog Image Migration Script (v3)
 *
 * Approach:
 * 1. Find all WordPress URLs in imported-blog-posts.ts
 * 2. For each URL, find the best matching local image:
 *    a) Check public/images/blog-old/ for exact match
 *    b) Check src/resources/blog-old/ for exact match → copy
 *    c) Try fuzzy match: strip size suffix, look for same base name with any size
 * 3. Replace all WordPress URLs with local paths in the .ts file
 *
 * Usage: node scripts/migrate-blog-images.mjs [--dry-run]
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const DRY_RUN = process.argv.includes('--dry-run')
const BLOG_POSTS_FILE = path.join(ROOT, 'src/lib/imported-blog-posts.ts')
const BACKUP_DIR = path.join(ROOT, 'src/resources/blog-old')
const PUBLIC_DIR = path.join(ROOT, 'public/images/blog-old')
const WP_URL_PREFIX = 'https://attraveiculos.com.br/wp-content/uploads/'
const LOCAL_PATH_PREFIX = '/images/blog-old/'

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extract the relative path from a WordPress URL: YYYY/MM/filename */
function wpUrlToRelPath(url) {
  const idx = url.indexOf('wp-content/uploads/')
  if (idx === -1) return null
  return url.substring(idx + 'wp-content/uploads/'.length)
}

/** Extract all unique WordPress image URLs from the blog posts file */
function extractWpUrls(content) {
  const urlRegex = /https:\/\/attraveiculos\.com\.br\/wp-content\/uploads\/[^\s"'\\,]+/g
  const matches = content.match(urlRegex) || []
  const cleaned = matches.map(url => url.replace(/\s+\d+w$/, '').trim())
  return [...new Set(cleaned)]
}

/**
 * Given a filename like "IMG-20240930-WA0393-1024x768.jpg",
 * strip the WordPress size suffix to get the base name: "IMG-20240930-WA0393"
 * and the extension: ".jpg"
 */
function parseImageName(filename) {
  const ext = path.extname(filename) // .jpg, .jpeg, .png
  const nameWithoutExt = path.basename(filename, ext)

  // WordPress generates sizes like: original-WIDTHxHEIGHT and also -scaled
  // Patterns: -1024x768, -2048x1536, -300x300, -scaled, -150x150, etc.
  const sizePattern = /(-\d+x\d+|-scaled)$/
  const baseName = nameWithoutExt.replace(sizePattern, '')

  return { baseName, ext, hadSuffix: baseName !== nameWithoutExt }
}

/**
 * Find the best matching file in a directory for a given filename.
 * Preference order:
 * 1. Exact match
 * 2. Same base name with -1024x768 suffix
 * 3. Same base name with -scaled suffix
 * 4. Same base name with -2048x1536 suffix
 * 5. Same base name without any suffix (original)
 * 6. Any file with the same base name
 */
function findBestMatch(dir, filename) {
  if (!fs.existsSync(dir)) return null

  // 1. Exact match
  const exactPath = path.join(dir, filename)
  if (fs.existsSync(exactPath)) return filename

  const { baseName, ext } = parseImageName(filename)
  const files = fs.readdirSync(dir)

  // Build preference list
  const preferredSuffixes = [
    '-1024x768', '-scaled', '-2048x1536', '-1536x1152',
    '-768x576', '-600x450', '-300x300', ''
  ]

  for (const suffix of preferredSuffixes) {
    const candidate = `${baseName}${suffix}${ext}`
    if (files.includes(candidate)) return candidate
  }

  // Last resort: any file with same base name
  const match = files.find(f => {
    const parsed = parseImageName(f)
    return parsed.baseName === baseName && parsed.ext === ext
  })

  return match || null
}

// ─── Main ───────────────────────────────────────────────────────────────────

function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗')
  console.log('║       Blog Image Migration Script v3                       ║')
  console.log('╚══════════════════════════════════════════════════════════════╝')
  if (DRY_RUN) console.log('\n🔍 DRY RUN MODE - No files will be modified\n')

  // 1. Read blog posts file
  console.log('📖 Reading blog posts file...')
  let blogContent = fs.readFileSync(BLOG_POSTS_FILE, 'utf-8')

  // 2. Extract all WordPress URLs
  const wpUrls = extractWpUrls(blogContent)
  console.log(`   Found ${wpUrls.length} unique WordPress image URLs\n`)

  if (wpUrls.length === 0) {
    console.log('✅ No WordPress URLs found — all images are already migrated!')
    return
  }

  // 3. Process each URL with fallback matching
  const resolved = []    // { url, relPath, localPath, source, matchedFile }
  const missing = []     // { url, relPath }

  console.log('🔗 Processing URLs...\n')

  for (const url of wpUrls) {
    const relPath = wpUrlToRelPath(url)
    if (!relPath) {
      missing.push({ url, reason: 'Could not parse relative path' })
      continue
    }

    const relDir = path.dirname(relPath)
    const filename = path.basename(relPath)
    const publicDir = path.join(PUBLIC_DIR, relDir)
    const backupSubDir = path.join(BACKUP_DIR, relDir)

    // Step 1: Exact match in public/
    const publicExact = path.join(PUBLIC_DIR, relPath)
    if (fs.existsSync(publicExact)) {
      const localPath = LOCAL_PATH_PREFIX + relPath
      resolved.push({ url, relPath, localPath, source: 'public-exact' })
      console.log(`  ✅ [PUBLIC]  ${relPath}`)
      continue
    }

    // Step 2: Exact match in backup → copy
    const backupExact = path.join(BACKUP_DIR, relPath)
    if (fs.existsSync(backupExact)) {
      const localPath = LOCAL_PATH_PREFIX + relPath
      if (!DRY_RUN) {
        fs.mkdirSync(publicDir, { recursive: true })
        fs.copyFileSync(backupExact, publicExact)
      }
      resolved.push({ url, relPath, localPath, source: 'backup-exact' })
      console.log(`  📦 [BACKUP] ${relPath}`)
      continue
    }

    // Step 3: Fuzzy match in backup → copy with matched name
    const matchedFile = findBestMatch(backupSubDir, filename)
    if (matchedFile) {
      const matchedRelPath = path.join(relDir, matchedFile).replace(/\\/g, '/')
      const localPath = LOCAL_PATH_PREFIX + matchedRelPath
      const matchedBackupPath = path.join(BACKUP_DIR, matchedRelPath)
      const matchedPublicPath = path.join(PUBLIC_DIR, matchedRelPath)

      if (!DRY_RUN) {
        fs.mkdirSync(path.dirname(matchedPublicPath), { recursive: true })
        if (!fs.existsSync(matchedPublicPath)) {
          fs.copyFileSync(matchedBackupPath, matchedPublicPath)
        }
      }
      resolved.push({ url, relPath, localPath, source: 'backup-fuzzy', matchedFile })
      console.log(`  🔍 [FUZZY]  ${relPath} → ${matchedFile}`)
      continue
    }

    // Step 4: Fuzzy match in public/
    const publicMatch = findBestMatch(publicDir, filename)
    if (publicMatch) {
      const matchedRelPath = path.join(relDir, publicMatch).replace(/\\/g, '/')
      const localPath = LOCAL_PATH_PREFIX + matchedRelPath
      resolved.push({ url, relPath, localPath, source: 'public-fuzzy', matchedFile: publicMatch })
      console.log(`  🔍 [FUZZY-P] ${relPath} → ${publicMatch}`)
      continue
    }

    // Step 5: Not found — still update path for consistency
    const localPath = LOCAL_PATH_PREFIX + relPath
    resolved.push({ url, relPath, localPath, source: 'not-found' })
    missing.push({ url, relPath })
    console.log(`  ⚠️  [MISSING] ${relPath}`)
  }

  // 4. Summary
  const exactPublic = resolved.filter(r => r.source === 'public-exact').length
  const exactBackup = resolved.filter(r => r.source === 'backup-exact').length
  const fuzzyBackup = resolved.filter(r => r.source === 'backup-fuzzy').length
  const fuzzyPublic = resolved.filter(r => r.source === 'public-fuzzy').length

  console.log('\n' + '═'.repeat(60))
  console.log('                    MIGRATION SUMMARY')
  console.log('═'.repeat(60))
  console.log(`  ✅ Exact in public/:    ${exactPublic}`)
  console.log(`  📦 Exact from backup:   ${exactBackup}`)
  console.log(`  🔍 Fuzzy from backup:   ${fuzzyBackup}`)
  console.log(`  🔍 Fuzzy in public/:    ${fuzzyPublic}`)
  console.log(`  ⚠️  Missing locally:     ${missing.length}`)
  console.log(`  📊 Total URLs:          ${wpUrls.length}`)

  // 5. Update blog posts file
  if (!DRY_RUN) {
    console.log('\n✏️  Updating blog posts file...')
    // Sort URLs by length descending to avoid partial replacements
    const sorted = [...resolved].sort((a, b) => b.url.length - a.url.length)
    for (const item of sorted) {
      blogContent = blogContent.split(item.url).join(item.localPath)
    }
    fs.writeFileSync(BLOG_POSTS_FILE, blogContent, 'utf-8')
    console.log(`   ✅ Updated ${resolved.length} URLs in blog posts file`)
  } else {
    console.log(`\n[DRY RUN] Would update ${resolved.length} URLs in blog posts file`)
  }

  // 6. Report missing files
  if (missing.length > 0) {
    console.log('\n\n⚠️  MISSING FILES (URL updated but image not found locally):')
    console.log('─'.repeat(60))
    for (const item of missing) {
      console.log(`  ${item.relPath || item.url}`)
    }
    console.log(`\n  These ${missing.length} images need to be added to:`)
    console.log(`  public/images/blog-old/ with the same directory structure`)
  }

  // 7. Final verification
  if (!DRY_RUN) {
    const updatedContent = fs.readFileSync(BLOG_POSTS_FILE, 'utf-8')
    const remainingUrls = extractWpUrls(updatedContent)
    console.log('\n📋 Post-migration check:')
    console.log(`   Remaining WordPress URLs: ${remainingUrls.length}`)
    if (remainingUrls.length === 0) {
      console.log('   🎉 All WordPress image URLs have been replaced!')
    }
  }

  console.log('\n' + '═'.repeat(60) + '\n')
}

main()
