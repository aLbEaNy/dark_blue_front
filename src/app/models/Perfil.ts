import Stats from "./Stats";

export default interface Perfil {
  id?: string;
  username: string;
  nickname: string;
  avatar: string;
  idActualGame?: string;
  stats: Stats;
}
