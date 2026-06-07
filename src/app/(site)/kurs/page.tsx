import type { Metadata } from 'next'
import { CourseListingView } from '@/components/CourseListingView'
import { getCourses, getSiteSettings } from '@/lib/sanity'
import { getPhoneDisplay, getPhoneTel } from '@/lib/utils'

export const revalidate = 3600

export const metadata: Metadata = {
  title: 'Kurs',
  description: 'Kommende kurs i soneterapi med Terje Horpestad.',
}

export default async function KursPage() {
  const [courses, settings] = await Promise.all([getCourses(), getSiteSettings()])
  const phoneDisplay = getPhoneDisplay(settings?.phone)
  const phoneTel = getPhoneTel(settings?.phone)

  return (
    <div className="py-16 md:py-24">
      <div className="container-wide section-padding mx-auto">
        <p className="mb-4 text-label">
          Utdanning
        </p>
        <h1 className="mb-4 text-heading-display">Kurs</h1>
        <p className="mb-10 max-w-xl text-body-lg">
          Terje Horpestad har utdannet soneterapeuter i over 20 år. Her finner du kommende kurs.
        </p>

        {courses.length > 0 ? (
          <CourseListingView
            courses={courses}
            phoneDisplay={phoneDisplay}
            phoneTel={phoneTel}
          />
        ) : (
          <p className="text-body-lg">
            Ingen planlagte kurs for øyeblikket. Ring for mer informasjon: {phoneDisplay}.
          </p>
        )}
      </div>
    </div>
  )
}
