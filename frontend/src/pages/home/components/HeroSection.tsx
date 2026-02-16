import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Hero image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://pre-webunwto.s3.eu-west-1.amazonaws.com/styles/webp/s3/2025-01/doing-business-morocco.jpg.webp?VersionId=ZpQvHa.K1onvtbaw5r2_NY8USY2lqQWz&itok=2Pm5T-be"
          alt="Morocco cityscape"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-brand-ocean/50" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ocean/50 via-brand-ocean/10 to-transparent" />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 py-28 text-center md:py-40">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white md:text-6xl">
            Plan Your City Trip{' '}
            <span className="text-brand-gold">in 60 Seconds</span>
          </h1>
        </motion.div>

        <motion.p
          className="mx-auto mt-6 max-w-xl text-lg text-white/80 md:text-xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Pick a city. Choose your interests.
          <br />
          We match you with the best experiences.
        </motion.p>

        <motion.div
          className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link
            to="/plan"
            className="inline-flex items-center gap-2 rounded-full bg-brand-gold px-8 py-3.5 text-base font-semibold text-brand-dark shadow-lg shadow-brand-gold/25 transition hover:bg-brand-gold-hover hover:shadow-brand-gold/40 no-underline"
          >
            <Icon icon="mdi:rocket-launch-outline" className="text-lg" />
            Start Planning
          </Link>
          <a
            href="#companies"
            className="inline-flex items-center gap-2 rounded-full border border-white/30 px-8 py-3.5 text-base font-medium text-white transition hover:border-white/60 hover:bg-white/10 hover:text-brand-gold"
          >
            Browse Ready-Made Tours
          </a>
        </motion.div>
      </div>
    </section>
  )
}
