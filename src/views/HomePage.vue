<script setup lang="ts">
import { HOME } from '@/utils/docs-logic'
import { seo } from '@/composables/useSeo'

seo({
  title: 'Valdi Documentation - Cross-Platform App Development Framework',
  description: 'Learn to build stunning cross-platform applications with Valdi. Comprehensive guides, API references, and hands-on tutorials.',
  canonical: 'https://valdi-docs.onecat.dev/',
  ogType: 'website'
})

const valdiUrl = 'https://github.com/Snapchat/Valdi'
</script>

<template>
  <div class="home">
    <!-- Hero Section -->
    <section class="home__hero">
      <div class="hero__glow"></div>
      <div class="hero__content">
        <div class="hero__badge">
          <span class="hero__badge-dot"></span>
          Unofficial Documentation
        </div>
        <h1 class="hero__title">
          <span class="hero__title-main">Valdi</span>
          <span class="hero__title-sub">Framework</span>
        </h1>
        <p class="hero__subtitle">
          Build stunning <strong>cross-platform applications</strong> with declarative UI,
          native performance, and seamless integration.
        </p>
        <div class="hero__stats">
          <div class="hero__stat">
            <span class="hero__stat-value">iOS</span>
            <span class="hero__stat-label">+ Android</span>
          </div>
          <div class="hero__stat-divider"></div>
          <div class="hero__stat">
            <span class="hero__stat-value">TypeScript</span>
            <span class="hero__stat-label">Native Speed</span>
          </div>
          <div class="hero__stat-divider"></div>
          <div class="hero__stat">
            <span class="hero__stat-value">1x</span>
            <span class="hero__stat-label">Codebase</span>
          </div>
        </div>
        <div class="hero__actions">
          <RouterLink :to="HOME.primary.href" class="hero__btn hero__btn--primary">
            Get Started
          </RouterLink>
          <a :href="valdiUrl" target="_blank" class="hero__btn hero__btn--secondary">
            View on GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- Quick Links -->
    <section class="home__quicklinks">
      <RouterLink v-for="link in HOME.quickLinks" :key="link.title" :to="link.href" class="quicklink__card">
        <!-- <div class="quicklink__icon" v-html="link.icon"></div> -->
        <div class="quicklink__content">
          <h3 class="quicklink__title">{{ link.title }}</h3>
          <p class="quicklink__desc">{{ link.desc }}</p>
        </div>
        <svg class="quicklink__arrow" viewBox="0 0 16 16" fill="currentColor"><path d="M6.47 3.22a.75.75 0 011.06 0L10 5.94l2.47-2.72a.75.75 0 111.06 1.06L10 8.06l-3.47-3.78a.75.75 0 010-1.06z"/></svg>
      </RouterLink>
    </section>

    <!-- Features Section -->
    <section class="home__features">
      <div v-for="f in HOME.features" :key="f.title" class="feature__card">

        <h3 class="feature__title">{{ f.title }}</h3>
        <p class="feature__desc">{{ f.desc }}</p>
        <RouterLink :to="f.href" class="feature__link">
          {{ f.label }}
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M5.22 3.22a.75.75 0 011.06 0l4.25 4.5a.75.75 0 010 1.06l-4.25 4.5a.75.75 0 01-1.06-1.06L8.69 8.5 5.22 5.03a.75.75 0 010-1.06z"/></svg>
        </RouterLink>
      </div>
    </section>

    <!-- About Section -->
    <section class="home__about">
      <div v-if="HOME.aboutMarkdown" class="about__card">
        <h2 class="about__title">{{ HOME.aboutMarkdown.title }}</h2>
        <p class="about__desc">{{ HOME.aboutMarkdown.desc }}</p>
        <a :href="HOME.aboutMarkdown.repoUrl" target="_blank" class="about__link">
          View on GitHub
          <svg viewBox="0 0 16 16" fill="currentColor"><path d="M7.775 3.275a.75.75 0 001.06 1.06l1.25-1.25a2 2 0 112.83 2.83l-2.5 2.5a2 2 0 01-2.83 0 .75.75 0 00-1.06 1.06 3.5 3.5 0 004.95 0l2.5-2.5a3.5 3.5 0 00-4.95-4.95l-1.25 1.25zm-4.69 9.64a2 2 0 010-2.83l2.5-2.5a2 2 0 012.83 0 .75.75 0 001.06-1.06 3.5 3.5 0 00-4.95 0l-2.5 2.5a3.5 3.5 0 004.95 4.95l1.25-1.25a.75.75 0 00-1.06-1.06l-1.25 1.25a2 2 0 01-2.83 0z"/></svg>
        </a>
      </div>
    </section>
  </div>
</template>
