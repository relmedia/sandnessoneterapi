import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, GraduationCap, MapPin } from 'lucide-react'
import { getSanityImageAspectStyle, urlFor } from '@/lib/sanity'
import { formatCourseDateRange } from '@/lib/utils'
import type { CourseListItem } from '@/lib/types'

type CourseCardProps = {
  course: CourseListItem
}

export function CourseCard({ course }: CourseCardProps) {
  const dateRange = formatCourseDateRange(course.startDate, course.endDate)
  const href = `/kurs/${course.slug.current}`

  return (
    <Link
      href={href}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-stone/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-sage/25 hover:shadow-lg"
    >
      {course.coverImage ? (
        <div
          className="relative overflow-hidden bg-sage-light"
          style={getSanityImageAspectStyle(course.coverImage)}
        >
          <Image
            src={urlFor(course.coverImage).width(640).url()}
            alt={course.coverImage.alt ?? course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-stone/30 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/90 shadow-sm backdrop-blur-sm">
            <GraduationCap className="h-5 w-5 text-sage-dark" strokeWidth={1.5} aria-hidden />
          </div>
        </div>
      ) : (
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-sage-light via-cream to-warm-light/60">
          <div
            aria-hidden
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-sage/10 blur-2xl"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/80 shadow-md ring-1 ring-stone/5 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
              <GraduationCap className="h-9 w-9 text-sage-dark" strokeWidth={1.5} aria-hidden />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-6 md:p-7">
        {dateRange && (
          <p className="mb-2 font-sans text-[11px] uppercase tracking-widest text-sage sm:text-xs">
            {dateRange}
          </p>
        )}
        <h3 className="font-serif text-2xl font-normal text-stone transition-colors group-hover:text-sage-dark">
          {course.title}
        </h3>
        {course.shortDescription && (
          <p className="mt-3 flex-1 font-sans text-sm font-light leading-relaxed text-muted line-clamp-3">
            {course.shortDescription}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-sans text-xs font-light text-muted">
          {course.location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" aria-hidden />
              {course.location}
            </span>
          )}
          {course.price != null && <span>{course.price.toLocaleString('nb-NO')} kr</span>}
        </div>
        <span className="mt-6 inline-flex items-center gap-2 font-sans text-sm font-light text-sage-dark">
          Les mer
          <ArrowRight
            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
            aria-hidden
          />
        </span>
      </div>
    </Link>
  )
}
