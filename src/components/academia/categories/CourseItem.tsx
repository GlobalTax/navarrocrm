
import React from 'react'
import { Badge } from '@/components/ui/badge'

interface Course {
  id: string
  title: string
  total_lessons: number
}

interface CourseItemProps {
  course: Course
  onTopicSelect: (topicId: string) => void
}

export function CourseItem({ course, onTopicSelect }: CourseItemProps) {
  return (
    <div
      className="flex items-center justify-between p-2 pl-4 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => onTopicSelect(course.id)}
    >
      <span className="text-sm text-gray-700 flex-1 min-w-0 truncate pr-2">
        {course.title}
      </span>
      <Badge variant="secondary" className="text-xs flex-shrink-0">
        {course.total_lessons}
      </Badge>
    </div>
  )
}
