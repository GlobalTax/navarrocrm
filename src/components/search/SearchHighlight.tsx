
import React from 'react'

interface SearchHighlightProps {
  text: string
  matches: number[]
  className?: string
}

export const SearchHighlight: React.FC<SearchHighlightProps> = ({ text, matches, className = '' }) => {
  if (!matches.length) {
    return <span className={className}>{text}</span>
  }

  const parts: { text: string; isHighlighted: boolean }[] = []
  let lastIndex = 0

  // Crear rangos contiguos de matches
  const ranges: { start: number; end: number }[] = []
  let currentRange: { start: number; end: number } | null = null

  matches.forEach(index => {
    if (!currentRange || index > currentRange.end + 1) {
      if (currentRange) {
        ranges.push(currentRange)
      }
      currentRange = { start: index, end: index }
    } else {
      currentRange.end = index
    }
  })

  if (currentRange) {
    ranges.push(currentRange)
  }

  // Construir partes del texto
  ranges.forEach(range => {
    // Texto antes del match
    if (range.start > lastIndex) {
      parts.push({
        text: text.slice(lastIndex, range.start),
        isHighlighted: false
      })
    }

    // Texto del match
    parts.push({
      text: text.slice(range.start, range.end + 1),
      isHighlighted: true
    })

    lastIndex = range.end + 1
  })

  // Texto después del último match
  if (lastIndex < text.length) {
    parts.push({
      text: text.slice(lastIndex),
      isHighlighted: false
    })
  }

  return (
    <span className={className}>
      {parts.map((part, index) => (
        <span
          key={index}
          className={part.isHighlighted ? 'bg-yellow-200 dark:bg-yellow-800 font-medium' : ''}
        >
          {part.text}
        </span>
      ))}
    </span>
  )
}
