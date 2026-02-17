#!/usr/bin/env node
/**
 * Fix Missing Blog Images
 * 
 * Scans imported-blog-posts.ts for all image references to /images/blog-old/,
 * checks which ones are missing from public/images/blog-old/,
 * and copies them from src/resources/blog-old/ backup if available.
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const ROOT = path.resolve(__dirname, '..')

const BLOG_POSTS_FILE = path.join(ROOT, 'src/lib/imported-blog-posts.ts')
const PUBLIC_DIR = path.join(ROOT, 'public/images/blog-old')
const BACKUP_DIR = path.join(ROOT, 'src/resources/blog-old')

// Extract all /images/blog-old/ references from the blog posts file
function extractImageRefs(content) {
  const regex = /\/images\/blog-old\/[^\s"'\\,)]+/g
  const matches = content.match(regex) || []
  return [...new Set(matches)]
}

// Strip WordPress size suffix to get base name
function parseImageName(filename) {
  const ext = path.extname(filename)
  const nameWithoutExt = path.basename(filename, ext)
  const sizePattern = /(-\d+x\d+|-scaled)$/
  const baseName = nameWithoutExt.replace(sizePattern, '')
  return { baseName, ext, nameWithoutExt }
}

// Find best match in a directory
function findBestMatch(dir, filename) {
  if (!fs.existsSync(dir)) return null

  // Exact match
  const exactPath = path.join(dir, filename)
  if (fs.existsSync(exactPath)) return filename

  const { baseName, ext } = parseImageName(filename)
  let files
  try { files = fs.readdirSync(dir) } catch { return null }

  // Try preferred suffixes
  const suffixes = ['-1024x768', '-2048x1536', '-1024x576', '-scaled', '-1536x1152', '-768x576', '']
  for (const suffix of suffixes) {
    const candidate = `${baseName}${suffix}${ext}`
    if (files.includes(candidate)) return candidate
  }

  // Any file with same base name
  return files.find(f => {
    const p = parseImageName(f)
    return p.baseName === baseName && p.ext === ext
  }) || null
}

function main() {
  console.log('=== Fix Missing Blog Images ===\n')

  const content = fs.readFileSync(BLOG_POSTS_FILE, 'utf-8')
  const refs = extractImageRefs(content)
  console.log(`Found ${refs.length} unique image references\n`)

  let existingCount = 0
  let copiedCount = 0
  let fuzzyCount = 0
  let missingCount = 0
  const missing = []
  const copied = []
  const fuzzyMatches = []
  let contentUpdated = content

  for (const ref of refs) {
    const relPath = ref.replace('/images/blog-old/', '')
    const publicPath = path.join(PUBLIC_DIR, relPath)

    // Already exists
    if (fs.existsSync(publicPath)) {
      existingCount++
      continue
    }

    const relDir = path.dirname(relPath)
    const filename = path.basename(relPath)
    const backupSubDir = path.join(BACKUP_DIR, relDir)

    // Try exact match in backup
    const backupExact = path.join(BACKUP_DIR, relPath)
    if (fs.existsSync(backupExact)) {
      const destDir = path.dirname(publicPath)
      fs.mkdirSync(destDir, { recursive: true })
      fs.copyFileSync(backupExact, publicPath)
      copiedCount++
      copied.push(relPath)
      console.log(`  COPIED: ${relPath}`)
      continue
    }

    // Try fuzzy match in backup
    const match = findBestMatch(backupSubDir, filename)
    if (match) {
      const matchedRelPath = path.join(relDir, match).replace(/\\/g, '/')
      const matchedBackup = path.join(BACKUP_DIR, matchedRelPath)
      const matchedPublic = path.join(PUBLIC_DIR, matchedRelPath)
      
      fs.mkdirSync(path.dirname(matchedPublic), { recursive: true })
      if (!fs.existsSync(matchedPublic)) {
        fs.copyFileSync(matchedBackup, matchedPublic)
      }
      
      // Update reference in content
      const oldRef = `/images/blog-old/${relPath}`
      const newRef = `/images/blog-old/${matchedRelPath}`
      contentUpdated = contentUpdated.split(oldRef).join(newRef)
      
      fuzzyCount++
      fuzzyMatches.push(`${relPath} -> ${matchedRelPath}`)
      console.log(`  FUZZY:  ${relPath} -> ${match}`)
      continue
    }

    missingCount++
    missing.push(relPath)
    console.log(`  MISSING: ${relPath}`)
  }

  // Write updated content if fuzzy matches changed paths
  if (fuzzyCount > 0) {
    fs.writeFileSync(BLOG_POSTS_FILE, contentUpdated, 'utf-8')
    console.log(`\nUpdated ${fuzzyCount} references in blog posts file`)
  }

  console.log('\n=== SUMMARY ===')
  console.log(`  Already existed:  ${existingCount}`)
  console.log(`  Exact copied:     ${copiedCount}`)
  console.log(`  Fuzzy matched:    ${fuzzyCount}`)
  console.log(`  Still missing:    ${missingCount}`)
  console.log(`  Total references: ${refs.length}`)

  if (missing.length > 0) {
    console.log('\n=== STILL MISSING ===')
    missing.forEach(m => console.log(`  ${m}`))
  }
}

main()

