import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

interface CompanyCard {
  name: string
  badge: string
  groupSize: string
  duration: string
  price: string
}

const companies: CompanyCard[] = [
  {
    name: 'Sahara Expeditions',
    badge: 'Licensed',
    groupSize: 'Up to 12',
    duration: '3 hours',
    price: 'From 350 MAD',
  },
  {
    name: 'Medina Walks',
    badge: 'Licensed',
    groupSize: 'Up to 8',
    duration: '2.5 hours',
    price: 'From 250 MAD',
  },
  {
    name: 'Atlas Adventures',
    badge: 'Licensed',
    groupSize: 'Up to 15',
    duration: '5 hours',
    price: 'From 500 MAD',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function TourismCompanies() {
  return (
    <section id="companies" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            City Tours by Trusted Companies
          </h2>
          <p className="mt-3 max-w-xl mx-auto text-gray-500">
            Licensed Moroccan tourism companies offering structured experiences.
          </p>
        </div>

        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {companies.map((company) => (
            <motion.div
              key={company.name}
              variants={item}
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-brand-ocean/30 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-ocean/10">
                  <Icon icon="mdi:domain" className="text-xl text-brand-ocean-light" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{company.name}</h3>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400">
                    <Icon icon="mdi:check-decagram" className="text-sm" />
                    {company.badge}
                  </span>
                </div>
              </div>

              <div className="mt-5 space-y-2.5 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:account-group-outline" className="text-base text-gray-400" />
                  {company.groupSize}
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:clock-outline" className="text-base text-gray-400" />
                  {company.duration}
                </div>
                <div className="flex items-center gap-2">
                  <Icon icon="mdi:tag-outline" className="text-base text-gray-400" />
                  {company.price}
                </div>
              </div>

              <button className="mt-5 w-full rounded-xl bg-gray-100 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-200 hover:text-gray-900">
                View Tours
              </button>
            </motion.div>
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-600 transition hover:border-gray-400 hover:text-gray-900"
          >
            Explore Company Tours
            <Icon icon="mdi:arrow-right" className="text-base" />
          </a>
        </div>
      </div>
    </section>
  )
}
