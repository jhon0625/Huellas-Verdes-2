import { supabase } from '../supabaseClient'
import { DEFAULT_EQUIPPED } from '../constants/avatars'

/**
 * Obtiene las huellas, el inventario y la ropa equipada del usuario.
 */
export async function getProfileCharacterData(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('huellas, inventory, equipped')
      .eq('id', userId)
      .single()

    if (error || !data) {
      return { huellas: 0, inventory: [], equipped: DEFAULT_EQUIPPED }
    }

    return {
      huellas: data.huellas || 0,
      inventory: Array.isArray(data.inventory) ? data.inventory : [],
      equipped: data.equipped || DEFAULT_EQUIPPED
    }
  } catch (err) {
    console.warn('Usando valores por defecto del personaje:', err)
    return { huellas: 0, inventory: [], equipped: DEFAULT_EQUIPPED }
  }
}

/**
 * Compra una prenda: verifica si tiene suficiente saldo, descuenta las huellas
 * y agrega la prenda al inventario del usuario.
 */
export async function buyClothingItem(userId, item, currentHuellas, currentInventory) {
  if (currentHuellas < item.price) {
    throw new Error('No tienes suficientes Huellas Verdes para esta prenda.')
  }

  if (currentInventory.includes(item.id)) {
    throw new Error('Ya posees esta prenda en tu armario.')
  }

  const updatedHuellas = currentHuellas - item.price
  const updatedInventory = [...currentInventory, item.id]

  const { error } = await supabase
    .from('profiles')
    .update({
      huellas: updatedHuellas,
      inventory: updatedInventory
    })
    .eq('id', userId)

  if (error) {
    console.error('Error al procesar la compra:', error)
    throw new Error('No se pudo completar la compra. Verifica tu conexión o base de datos.')
  }

  return { updatedHuellas, updatedInventory }
}

/**
 * Equipa o desequipa una prenda de una categoría.
 * Si la prenda elegida ya está equipada, la desequipa (pasa a null).
 */
export async function toggleEquipItem(userId, categoryId, itemId, currentEquipped) {
  const isAlreadyEquipped = currentEquipped[categoryId] === itemId
  const updatedEquipped = {
    ...currentEquipped,
    [categoryId]: isAlreadyEquipped ? null : itemId
  }

  const { error } = await supabase
    .from('profiles')
    .update({ equipped: updatedEquipped })
    .eq('id', userId)

  if (error) {
    console.error('Error al equipar la prenda:', error)
    throw new Error('No se pudo guardar el cambio de ropa.')
  }

  return updatedEquipped
}