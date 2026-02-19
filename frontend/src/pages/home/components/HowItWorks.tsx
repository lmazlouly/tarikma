import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

interface Step {
  number: string
  title: string
  description: string
  icon: string
}

const steps: Step[] = [
  {
    number: '01',
    title: 'Choose your city',
    description: 'Pick from Morocco\'s most vibrant destinations.',
    icon: 'mdi:map-marker-outline',
  },
  {
    number: '02',
    title: 'Select your interests',
    description: 'Culture, Food, History, Nature, or Adventure — tell us what you love.',
    icon: 'mdi:heart-outline',
  },
  {
    number: '03',
    title: 'Get matched instantly',
    description: 'We connect you with licensed companies, verified guides, or curated circuits.',
    icon: 'mdi:lightning-bolt-outline',
  },
]

const interests = ['Culture', 'Food', 'History', 'Nature', 'Adventure']

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="px-6 py-20">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            How It Works
          </h2>
          <p className="mt-3 text-gray-500">
            Three simple steps to your perfect trip.
          </p>
        </div>

        <motion.div
          className="mt-14 grid gap-8 md:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {steps.map((step) => (
            <motion.div
              key={step.number}
              variants={item}
              className="relative rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-ocean/10">
                <Icon icon={step.icon} className="text-2xl text-brand-ocean-light" />
              </div>
              <span className="mt-4 block text-xs font-semibold uppercase tracking-wider text-brand-ocean-light">
                Step {step.number}
              </span>
              <h3 className="mt-2 text-lg font-semibold text-gray-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* Interest pills */}
        <motion.div
          className="mt-10 flex flex-wrap justify-center gap-3"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          {interests.map((interest) => (
            <span
              key={interest}
              className="rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-sm text-gray-600 transition hover:border-brand-ocean/40 hover:text-gray-900"
            >
              {interest}
            </span>
          ))}
        </motion.div>

        {/* Match explanation */}
        <motion.div
          className="mt-12 rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <p className="text-sm font-medium text-gray-600">
            You'll be matched with:
          </p>
          <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
            <span className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Icon icon="mdi:domain" className="text-lg text-brand-ocean-light" />
              Licensed tourism companies
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Icon icon="mdi:account-check-outline" className="text-lg text-brand-ocean-light" />
              Verified independent guides
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-gray-500">
              <Icon icon="mdi:map-outline" className="text-lg text-brand-ocean-light" />
              Curated city circuits
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
