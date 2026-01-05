// 📁 DIRECTORIO: src/utils/typeUtils.ts
// 📄 ARCHIVO: typeUtils.ts
// 🔧 UTILIDAD: Conversiones seguras de tipos para evitar errores JNI con React Native

/**
 * Convierte un valor booleano a string de forma segura para props de React Native
 * @param value - Valor booleano a convertir
 * @param trueValue - String cuando es true
 * @param falseValue - String cuando es false
 */
export const booleanToString = (
  value: boolean | undefined,
  trueValue: string = 'true',
  falseValue: string = 'false'
): string => {
  return value ? trueValue : falseValue;
};

/**
 * Convierte un valor booleano a un indicador numérico (0 o 1)
 * @param value - Valor booleano a convertir
 */
export const booleanToNumber = (value: boolean | undefined): 0 | 1 => {
  return value ? 1 : 0;
};

/**
 * Asegura que un valor sea un string (nunca boolean)
 * @param value - Cualquier valor
 */
export const ensureString = (value: any): string => {
  if (typeof value === 'string') return value;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return value.toString();
  return String(value || '');
};

/**
 * Asegura que un valor sea un booleano para uso en condicionales JS
 * @param value - Cualquier valor
 */
export const ensureBoolean = (value: any): boolean => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') return value === 'true' || value === '1';
  return Boolean(value);
};

/**
 * Wrapper seguro para props booleanos en componentes Android-sensitive
 * Convierte automáticamente booleans a valores seguros
 */
export const safeProps = {
  editable: (enabled: boolean): boolean => Boolean(enabled),
  scrollEnabled: (enabled: boolean): boolean => Boolean(enabled),
  secureTextEntry: (secure: boolean): boolean => Boolean(secure),
  multiline: (multi: boolean): boolean => Boolean(multi),
  disabled: (disabled: boolean): boolean => Boolean(disabled),
  activeOpacity: (opacity?: number): number => opacity ?? 0.7,
};