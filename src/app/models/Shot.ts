export default interface Shot {
  position: string; // ej. "A5"
  result: 'HIT' | 'MISS'; // si es un acierto o agua
}
