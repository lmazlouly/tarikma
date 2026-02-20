import { motion } from 'framer-motion'
import { Icon } from '@iconify/react'

interface CityCard {
  name: string
  tagline: string
  image: string
}

const cities: CityCard[] = [
  {
    name: 'Marrakech',
    tagline: 'The Red City of endless souks & riads',
    image: 'https://images.unsplash.com/photo-1597212618440-806262de4f6b?w=600&h=400&fit=crop',
  },
  {
    name: 'Chefchaouen',
    tagline: 'The Blue Pearl of the Rif Mountains',
    image: 'https://i.pinimg.com/originals/c3/53/65/c35365a853ead78c1ca4c5721be7599f.jpg',
  },
  {
    name: 'Fes',
    tagline: 'The spiritual & cultural heart of Morocco',
    image: 'https://tse2.mm.bing.net/th/id/OIP.aB5fcs0philVP2dVxhC6fwHaEz?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
  {
    name: 'Tangier',
    tagline: 'Where the Atlantic meets the Mediterranean',
    image: 'https://tse1.mm.bing.net/th/id/OIP.dCcYr1jPM0SB6T2iqxQ-MwHaE8?rs=1&pid=ImgDetMain&o=7&rm=3',
  },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export function CitySelection() {
  return (
    <section id="cities" className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
            Choose Your City
          </h2>
          <p className="mt-3 text-gray-500">
            Start your adventure — pick a destination.
          </p>
        </div>

        <motion.div
          className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
        >
          {cities.map((city) => (
            <motion.div
              key={city.name}
              variants={item}
              className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:border-brand-ocean/40 hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={city.image}
                  alt={city.name}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-semibold text-gray-900">{city.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{city.tagline}</p>
                <button className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-ocean-light transition hover:text-brand-ocean">
                  Plan My Trip
                  <Icon icon="mdi:arrow-right" className="text-base" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
