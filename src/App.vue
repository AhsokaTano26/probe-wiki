<script setup>
import AppNav from './components/AppNav.vue'
import HeroSection from './components/HeroSection.vue'
import ArchitectureSection from './components/ArchitectureSection.vue'
import AboutSection from './components/AboutSection.vue'
import DistributedSection from './components/DistributedSection.vue'
import JoinSection from './components/JoinSection.vue'
import DeploySection from './components/DeploySection.vue'
import DetailsSection from './components/DetailsSection.vue'
import StatusSection from './components/StatusSection.vue'
import FaqSection from './components/FaqSection.vue'
import SiteFooter from './components/SiteFooter.vue'
</script>

<template>
  <AppNav />

  <main id="top">

    <HeroSection />

    <ArchitectureSection />

    <AboutSection />

    <DistributedSection />

    <JoinSection />

    <DeploySection />

    <DetailsSection />

    <StatusSection />

    <FaqSection />

  </main>

  <SiteFooter />
</template>
