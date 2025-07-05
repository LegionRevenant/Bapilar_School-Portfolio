import { useRef } from 'react'

function WaterTank({ capacity, currentLevel, onLevelChange }) {
  const tankRef = useRef(null)
  const levelPercentage = (currentLevel / capacity) * 100

  // Clicking is disabled
  const handleTankClick = (e) => {
    if (!tankRef.current) return
    const rect = tankRef.current.getBoundingClientRect()
    const y = e.clientY - rect.top
    const height = rect.height
    const clickPercent = 100 - ((y / height) * 100)
    const newLevel = parseFloat(((clickPercent / 100) * capacity).toFixed(2))
    const boundedLevel = Math.max(0, Math.min(capacity, newLevel))
    // onLevelChange(boundedLevel)
  }

  // Color + status
  let backgroundColor = '#3b82f6'
  let status = 'Normal'
  let statusColor = 'text-blue-600'

  if (levelPercentage < 20) {
    backgroundColor = '#ef4444'
    status = 'Low'
    statusColor = 'text-red-600'
  } else if (levelPercentage > 80) {
    backgroundColor = '#22c55e'
    status = 'High'
    statusColor = 'text-green-600'
  }

  const markers = Array.from({ length: 10 }, (_, i) => {
  const percent = (i + 1) * 10
  const value = ((percent / 100) * capacity).toFixed(2)
  return { percent, value }
  }).reverse()

  return (
    <div 
      ref={tankRef}
      className="water-tank cursor-default relative mb-4"
      onClick={handleTankClick}
    >
      {/* Fill */}
      <div 
        className="water-level absolute bottom-0 left-0 w-full transition-all duration-500"
        style={{ 
          height: `${levelPercentage}%`,
          backgroundColor,
          borderBottomLeftRadius: '0.5rem',
          borderBottomRightRadius: '0.5rem'
        }}
      >
        <div className="water-ripple"></div>
      </div>

      {/* Markers */}
      <div className="absolute top-0 left-0 h-full w-20 flex flex-col justify-between p-2 text-xs font-medium">
        {markers.map(({ percent, value }, idx) => (
          <div
            key={idx}
            className="absolute left-0 w-full flex items-center text-xs text-blue-900 font-medium"
            style={{ bottom: `${percent}%` }}
          >
            <span className="ml-1 w-12">{value} L</span>
            <div className="flex-1 border-t border-dashed border-blue-400" />
          </div>
        ))}
      </div>

      {/* Bubble */}
      {currentLevel > 0 && (
        <div 
          className="absolute right-4 bg-white px-2 py-1 rounded-md text-blue-600 font-bold shadow-sm flex flex-col items-end"
          style={{ bottom: `${levelPercentage}%`, transform: 'translateY(50%)' }}
        >
          <div>{currentLevel.toFixed(2)}L</div>
          <div className={`text-xs font-semibold ${statusColor}`}>{status}</div>
        </div>
      )}
    </div>
  )
}

export default WaterTank
