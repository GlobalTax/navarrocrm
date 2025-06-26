
export type PositionType = 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left'

export const getPositionClasses = (position: PositionType): string => {
  const positions = {
    'top-right': 'top-4 right-4',
    'bottom-right': 'bottom-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-left': 'bottom-4 left-4'
  }
  return positions[position]
}
