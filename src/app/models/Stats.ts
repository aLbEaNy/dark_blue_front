export default interface Stats {
  fechaRegistro: Date;
  stage: Number;
  coins: Number;
  wins: Number;
  losses: Number;
  playTime?: number; // total en milisegundos
  currentStartTime?: number; // timestamp del inicio actual
  rango?: string;
  specials?: string[];
  specialSlot1?: string;
  specialSlot2?: string;

}
