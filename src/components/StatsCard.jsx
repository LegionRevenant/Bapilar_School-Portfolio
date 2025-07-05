function StatsCard({ title, value, unit }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 flex flex-col">
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      <div className="flex items-center mt-2">
        <p className="text-2xl font-semibold">{value !== null ? value : '-------'}</p>
        {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  )
}

export default StatsCard