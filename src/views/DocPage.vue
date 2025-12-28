<script setup lang="ts">
import { computed } from 'vue'
import DocsLayout from '../components/DocsLayout.vue'
import { route } from '@/utils/docs-logic'
import { parseMarkdown } from '@/utils/markdown'
import { docMeta } from '@/utils/seo'
import { seo } from '@/composables/useSeo'
import '@/assets/markdown.css'

const props = defineProps<{ category: string; slug: string | string[] }>()
const fullSlug = computed(() => `${props.category}/${Array.isArray(props.slug) ? props.slug.join('/') : props.slug}`)
const res = computed(() => route(fullSlug.value))
const is404 = computed(() => res.value.status === 404)
const is500 = computed(() => res.value.status === 500)
const rawContent = computed(() => res.value.data?.content || '')
const htmlContent = computed(() => parseMarkdown(rawContent.value))

const pageTitle = computed(() => rawContent.value?.match(/^#\s+(.+)$/m)?.[1]
  || String(props.slug).split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  || 'Documentation')

const seoMeta = computed(() => {
  if (is404.value) return { title: '404 - Page Not Found', description: 'Not found', robots: 'noindex' }
  if (is500.value) return { title: '500 - Error', description: 'Error', robots: 'noindex' }
  return docMeta(props.category, String(props.slug), pageTitle.value, rawContent.value)
})

seo(seoMeta)

// Breadcrumb path
const breadcrumbPath = computed(() => {
  const parts = fullSlug.value.split('/')
  return parts.map((p, i) => ({
    name: p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    href: '/' + parts.slice(0, i + 1).join('/')
  }))
})
</script>

<template>
  <DocsLayout>
    <div v-if="is404" class="not-found">
      <div class="not-found__code">404</div>
      <p class="not-found__message">Document not found</p>
      <RouterLink to="/" class="home__btn home__btn--primary">Back to Home</RouterLink>
    </div>
    <div v-else-if="is500" class="not-found">
      <div class="not-found__code">500</div>
      <p class="not-found__message">An error occurred</p>
      <RouterLink to="/" class="home__btn home__btn--primary">Back to Home</RouterLink>
    </div>
    <div v-else class="docs-content__wrapper">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <span class="breadcrumb__item">docs</span>
        <span class="breadcrumb__sep">/</span>
        <template v-for="(part, i) in breadcrumbPath" :key="part.href">
          <RouterLink :to="part.href" class="breadcrumb__item">{{ part.name }}</RouterLink>
          <span v-if="i < breadcrumbPath.length - 1" class="breadcrumb__sep">/</span>
        </template>
      </nav>

      <h1 class="docs-content__title">{{ pageTitle }}</h1>
      <div class="docs-content__meta">
        <span>{{ fullSlug }}</span>
      </div>
      <div class="docs-content__text markdown-content" v-html="htmlContent"></div>
    </div>
  </DocsLayout>
</template>
