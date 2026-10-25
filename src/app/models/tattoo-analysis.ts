/**
 * Resultado del análisis de un tatuaje por IA (POST /api/ia/analyze-tattoo).
 *
 * El backend hace de proxy hacia Gemini y devuelve el JSON que responde el
 * modelo, así que esto es un contrato "blando": el texto es libre y no hay
 * garantía de que respete los campos. La vista debe tolerar valores raros (de
 * ahí que complejidad y tiempo sean `string` y no enums cerrados).
 */
export interface TattooAnalysis {
  /** Nivel estimado (bajo, medio, alto…) tal como lo redacta el modelo. */
  complejidad: string;
  /** Duración estimada en texto libre ("3-4 horas"); no es un número. */
  tiempo: string;
  // Los precios se guardan como número para poder formatearlos con el pipe
  // de moneda (se pintan en COP) y para no depender del separador de miles
  // que use el modelo en su respuesta.
  precioMin: number;
  precioMax: number;
  /** Explicación del cálculo; se muestra al usuario tal cual llega. */
  justificacion: string;
}