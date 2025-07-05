import { useState, useEffect } from 'react'

function SettingsOverlay({ isOpen, onClose, initialSettings, onSave }) {
  const [settings, setSettings] = useState(initialSettings)
  const [error, setError] = useState('')

  useEffect(() => {
    setSettings(initialSettings)
    setError('')
  }, [initialSettings])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith('dimensions.')) {
      const key = name.split('.')[1]
      setSettings(prev => ({
        ...prev,
        dimensions: { ...prev.dimensions, [key]: Number(value) }
      }))
    } else if (name === 'thresholdValue') {
      setSettings(prev => ({
        ...prev,
        [name]: Number(value)
      }))
    } else {
      setSettings(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }
  }

  const handleSave = () => {
    const { height, width, length, diameter } = settings.dimensions
    const maxLiters = settings.tankShape === 'rectangular'
      ? (height * width * length) / 1000
      : (Math.PI * Math.pow(diameter / 2, 2) * height) / 1000

    if (settings.thresholdType === 'percentage') {
      if (settings.thresholdValue < 0 || settings.thresholdValue > 100) {
        setError('Percentage threshold must be between 0 and 100.')
        return
      }
    } else if (settings.thresholdType === 'liters') {
      if (settings.thresholdValue < 0 || settings.thresholdValue > maxLiters) {
        setError(`Liter threshold must be between 0 and ${Math.round(maxLiters)} L.`)
        return
      }
    }

    setError('')
    onSave(settings)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl shadow-xl">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-bold">Settings</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-black">✕</button>
        </div>

        {/* Alert Threshold */}
        <div className="mb-4">
          <h3 className="font-semibold">Alert Threshold</h3>
          <div className="flex gap-4 mt-2">
            <label>
              <input
                type="radio"
                name="thresholdType"
                value="percentage"
                checked={settings.thresholdType === 'percentage'}
                onChange={handleChange}
              /> %
            </label>
            <label>
              <input
                type="radio"
                name="thresholdType"
                value="liters"
                checked={settings.thresholdType === 'liters'}
                onChange={handleChange}
              /> L
            </label>
          </div>

          <input
            type="number"
            name="thresholdValue"
            min={0}
            max={settings.thresholdType === 'percentage' ? 100 : ''}
            value={settings.thresholdValue}
            onChange={handleChange}
            className="border mt-2 px-3 py-2 rounded w-full"
          />
          <p className="text-sm text-blue-700 mt-1">
            Alert if below: {settings.thresholdValue}{settings.thresholdType === 'percentage' ? '%' : 'L'}
          </p>
          {error && (
            <p className="text-sm text-red-600 font-medium mt-1">
              {error}
            </p>
          )}
        </div>

        {/* Tank Shape */}
        <div className="mb-4">
          <h3 className="font-semibold">Tank Shape</h3>
          <select
            name="tankShape"
            value={settings.tankShape}
            onChange={handleChange}
            className="mt-1 w-full border px-3 py-2 rounded"
          >
            <option value="rectangular">Rectangular</option>
            <option value="cylindrical">Cylindrical</option>
          </select>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {settings.tankShape === 'rectangular' && (
            <>
              <div>
                <label htmlFor="length" className="block mb-1 font-semibold">Length (cm)</label>
                <input
                  id="length"
                  name="dimensions.length"
                  type="number"
                  value={settings.dimensions.length}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
              <div>
                <label htmlFor="width" className="block mb-1 font-semibold">Width (cm)</label>
                <input
                  id="width"
                  name="dimensions.width"
                  type="number"
                  value={settings.dimensions.width}
                  onChange={handleChange}
                  className="border px-3 py-2 rounded w-full"
                />
              </div>
            </>
          )}

          <div>
            <label htmlFor="height" className="block mb-1 font-semibold">Height (cm)</label>
            <input
              id="height"
              name="dimensions.height"
              type="number"
              value={settings.dimensions.height}
              onChange={handleChange}
              className="border px-3 py-2 rounded w-full"
            />
          </div>

          {settings.tankShape === 'cylindrical' && (
            <div>
              <label htmlFor="diameter" className="block mb-1 font-semibold">Diameter (cm)</label>
              <input
                id="diameter"
                name="dimensions.diameter"
                type="number"
                value={settings.dimensions.diameter}
                onChange={handleChange}
                className="border px-3 py-2 rounded w-full"
              />
            </div>
          )}
        </div>

        <div className="text-right">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-2 rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsOverlay
