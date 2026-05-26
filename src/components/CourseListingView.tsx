'use client'

import { useEffect, useState } from 'react'
import { LayoutGrid, Rows3 } from 'lucide-react'
import { CourseCard } from '@/components/CourseCard'
import { CourseListCard } from '@/components/CourseListCard'
import type { CourseListItem } from '@/lib/types'

type CourseListingViewMode = 'list' | 'grid'

const STORAGE_KEY = 'course-listing-view'

type CourseListingViewProps = {
  courses: CourseListItem[]
  phoneDisplay: string
  phoneTel: string
}

function getStoredView(): CourseListingViewMode {
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'grid' ? 'grid' : 'list'
}

function CourseGrid({ courses }: { courses: CourseListItem[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <CourseCard key={course._id} course={course} />
      ))}
    </div>
  )
}

export function CourseListingView({ courses, phoneDisplay, phoneTel }: CourseListingViewProps) {
  const [view, setView] = useState<CourseListingViewMode>('list')

  useEffect(() => {
    setView(getStoredView())
  }, [])

  function updateView(nextView: CourseListingViewMode) {
    setView(nextView)
    window.localStorage.setItem(STORAGE_KEY, nextView)
  }

  return (
    <div>
      <div className="mb-6 hidden items-center justify-end md:flex">
        <div
          className="inline-flex rounded-full border border-warm-light bg-cream p-1"
          role="group"
          aria-label="Velg visning"
        >
          <button
            type="button"
            onClick={() => updateView('list')}
            aria-pressed={view === 'list'}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-light tracking-wide transition-colors sm:text-sm ${
              view === 'list'
                ? 'bg-stone text-cream'
                : 'text-muted hover:text-stone'
            }`}
          >
            <Rows3 className="size-4 shrink-0" aria-hidden />
            Liste
          </button>
          <button
            type="button"
            onClick={() => updateView('grid')}
            aria-pressed={view === 'grid'}
            className={`inline-flex cursor-pointer items-center gap-2 rounded-full px-4 py-2 font-sans text-xs font-light tracking-wide transition-colors sm:text-sm ${
              view === 'grid'
                ? 'bg-stone text-cream'
                : 'text-muted hover:text-stone'
            }`}
          >
            <LayoutGrid className="size-4 shrink-0" aria-hidden />
            Kort
          </button>
        </div>
      </div>

      <div className="md:hidden">
        <CourseGrid courses={courses} />
      </div>

      <div className="hidden md:block">
        {view === 'grid' ? (
          <CourseGrid courses={courses} />
        ) : (
          <div className="flex flex-col gap-6">
            {courses.map((course) => (
              <CourseListCard
                key={course._id}
                course={course}
                phoneDisplay={phoneDisplay}
                phoneTel={phoneTel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
