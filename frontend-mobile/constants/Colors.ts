/*Define la paleta de colores para tema claro y oscuro.
   Exporta Colors (light/dark) y un gradiente principal.
    Se usa en las pantallas para mantener estilos consistentes.
*/
const tintColorLight = '#A855F7';
const tintColorDark = '#EC4899';

export const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    tint: tintColorLight,
    tabIconDefault: '#888',
    tabIconSelected: tintColorLight,
    border: '#e5e5e5',
    cardBackground: '#f9f9f9',
    inputBackground: '#f3f3f5',
    primary: '#030213',
    secondary: '#f3e8ff',
    destructive: '#d4183d',
    muted: '#888',
  },
  dark: {
    text: '#fff',
    background: '#1a1a1a',
    tint: tintColorDark,
    tabIconDefault: '#888',
    tabIconSelected: tintColorDark,
    border: '#333',
    cardBackground: '#2a2a2a',
    inputBackground: '#3a3a3a',
    primary: '#fff',
    secondary: '#2a2a3a',
    destructive: '#ff6b6b',
    muted: '#999',
  },
};

export const Gradients = {
  primary: ['#a855f7', '#ec4899'],
};