/**
 * Tests pour lib/utils.ts
 *
 * Exemple de TDD appliqué au projet KLUB.
 * Ces tests documentent le comportement attendu des utilitaires.
 */

import {
  formatCurrency,
  calculateRentalDays,
  needsFeedback,
  truncate,
  getInitials,
  isValidRating,
} from '@/lib/utils'

// ──────────────────────────────────────────
// formatCurrency
// ──────────────────────────────────────────
describe('formatCurrency', () => {
  it('formate un montant en euros', () => {
    expect(formatCurrency(100)).toContain('100')
    expect(formatCurrency(100)).toContain('€')
  })

  it('formate les décimales correctement', () => {
    const result = formatCurrency(99.5)
    expect(result).toContain('99')
  })

  it('gère zéro', () => {
    const result = formatCurrency(0)
    expect(result).toContain('0')
  })
})

// ──────────────────────────────────────────
// calculateRentalDays
// ──────────────────────────────────────────
describe('calculateRentalDays', () => {
  it('calcule correctement 1 jour', () => {
    const start = new Date('2026-01-01')
    const end = new Date('2026-01-02')
    expect(calculateRentalDays(start, end)).toBe(1)
  })

  it('calcule correctement 7 jours', () => {
    const start = new Date('2026-01-01')
    const end = new Date('2026-01-08')
    expect(calculateRentalDays(start, end)).toBe(7)
  })

  it('arrondit au supérieur pour les fractions de jours', () => {
    const start = new Date('2026-01-01T00:00:00')
    const end = new Date('2026-01-01T12:00:00') // 0.5 jour → arrondi à 1
    expect(calculateRentalDays(start, end)).toBe(1)
  })
})

// ──────────────────────────────────────────
// needsFeedback
// ──────────────────────────────────────────
describe('needsFeedback', () => {
  it('retourne false si le projet n\'est pas terminé', () => {
    const project = {
      status: 'in_progress',
      feedback_given: false,
      end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
    expect(needsFeedback(project)).toBe(false)
  })

  it('retourne false si le feedback a déjà été donné', () => {
    const project = {
      status: 'completed',
      feedback_given: true,
      end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
    expect(needsFeedback(project)).toBe(false)
  })

  it('retourne true si le projet est terminé depuis >24h et sans feedback', () => {
    const project = {
      status: 'completed',
      feedback_given: false,
      end_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    }
    expect(needsFeedback(project)).toBe(true)
  })

  it('retourne false si le projet vient juste de se terminer (<24h)', () => {
    const project = {
      status: 'completed',
      feedback_given: false,
      end_date: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 min ago
    }
    expect(needsFeedback(project)).toBe(false)
  })
})

// ──────────────────────────────────────────
// truncate
// ──────────────────────────────────────────
describe('truncate', () => {
  it('ne tronque pas si le texte est plus court que la limite', () => {
    expect(truncate('Bonjour', 10)).toBe('Bonjour')
  })

  it('ne tronque pas si le texte est exactement à la limite', () => {
    expect(truncate('Bonjour', 7)).toBe('Bonjour')
  })

  it('tronque et ajoute "..." si le texte dépasse la limite', () => {
    expect(truncate('Bonjour le monde', 7)).toBe('Bonjour...')
  })
})

// ──────────────────────────────────────────
// getInitials
// ──────────────────────────────────────────
describe('getInitials', () => {
  it('retourne les 2 premières initiales', () => {
    expect(getInitials('Jean Dupont')).toBe('JD')
  })

  it('met les initiales en majuscules', () => {
    expect(getInitials('alexis delburg')).toBe('AD')
  })

  it('ne retourne que 2 caractères max', () => {
    expect(getInitials('Jean Paul Martin')).toBe('JP')
  })
})

// ──────────────────────────────────────────
// isValidRating
// ──────────────────────────────────────────
describe('isValidRating', () => {
  it('accepte les notes entre 1 et 5', () => {
    expect(isValidRating(1)).toBe(true)
    expect(isValidRating(3)).toBe(true)
    expect(isValidRating(5)).toBe(true)
  })

  it('rejette les notes hors limites', () => {
    expect(isValidRating(0)).toBe(false)
    expect(isValidRating(6)).toBe(false)
    expect(isValidRating(-1)).toBe(false)
  })
})
