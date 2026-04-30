import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import { useAuth } from './AuthContext'

const PetContext = createContext(null)

export function PetProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [pets, setPets]               = useState([])
  const [activePetId, setActivePetId] = useState(null)
  const [currentTheme, setCurrentTheme] = useState('other')
  const [loading, setLoading]         = useState(false)

  // Cargar mascotas cuando el usuario se autentica
  useEffect(() => {
    if (!isAuthenticated) {
      setPets([])
      setActivePetId(null)
      setCurrentTheme('other')
      return
    }
    setLoading(true)
    api.get('/pets')
      .then(data => {
        setPets(data)
        if (data.length > 0) {
          setActivePetId(prev => prev || data[0].id)
          setCurrentTheme(data[0].species)
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [isAuthenticated])

  const addPet = useCallback(async (petData) => {
    const pet = await api.post('/pets', petData)
    setPets(prev => [pet, ...prev])
    setActivePetId(pet.id)
    setCurrentTheme(pet.species)
    return pet
  }, [])

  const updatePet = useCallback(async (id, updates) => {
    const updated = await api.put(`/pets/${id}`, updates)
    setPets(prev => prev.map(p => p.id === id ? updated : p))
    return updated
  }, [])

  const deletePet = useCallback(async (id) => {
    await api.delete(`/pets/${id}`)
    setPets(prev => {
      const filtered = prev.filter(p => p.id !== id)
      if (activePetId === id) {
        setActivePetId(filtered[0]?.id || null)
        setCurrentTheme(filtered[0]?.species || 'other')
      }
      return filtered
    })
  }, [activePetId])

  const getActivePet = useCallback(
    () => pets.find(p => p.id === activePetId),
    [pets, activePetId]
  )

  return (
    <PetContext.Provider value={{
      pets,
      loading,
      addPet,
      updatePet,
      deletePet,
      activePetId,
      setActivePetId,
      getActivePet,
      currentTheme,
      setCurrentTheme,
    }}>
      {children}
    </PetContext.Provider>
  )
}

export function usePets() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePets debe usarse dentro de PetProvider')
  return ctx
}
