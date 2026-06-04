import en from '@/messages/en.json'
import es from '@/messages/es.json'
import howItWorksEn from '@/messages/how-it-works-en.json'
import howItWorksEs from '@/messages/how-it-works-es.json'
import ourStoryEn from '@/messages/our-story-en.json'
import ourStoryEs from '@/messages/our-story-es.json'
import extendedEn from '@/messages/extended-en.json'
import extendedEs from '@/messages/extended-es.json'
import landingEn from '@/messages/landing-en.json'
import landingEs from '@/messages/landing-es.json'
import { defaultLocale, isLocale, type Locale } from './config'

const enMessages = { ...en, ...extendedEn, howItWorks: howItWorksEn, ourStory: ourStoryEn, landing: landingEn }
const esMessages = { ...es, ...extendedEs, howItWorks: howItWorksEs, ourStory: ourStoryEs, landing: landingEs }

export type Messages = typeof enMessages

export const dictionaries: Record<Locale, Messages> = {
  en: enMessages,
  es: esMessages,
}

export function getDictionary(locale: string | undefined | null): Messages {
  return dictionaries[isLocale(locale) ? locale : defaultLocale]
}
