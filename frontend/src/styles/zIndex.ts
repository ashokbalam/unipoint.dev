/**
 * Centralized z-index management.
 * This ensures a consistent stacking order across the application.
 */
export const zIndex = {
  footer: 50,
  header: 100,
  godModeSlider: 110,
  godModeOverlay: 105,
  headerContent: 1, // Must be below the header itself
  // Team Selection Page
  arrowButton: 20,
  searchInput: 10,
  suggestionText: 5,
}; 