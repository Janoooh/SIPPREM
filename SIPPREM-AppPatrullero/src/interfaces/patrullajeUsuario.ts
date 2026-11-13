export interface PatrullajeUsuario {
  id_patrullaje: number;
  id_proyecto: number;
  nombre_proyecto: string;
  hora_inicio: string;
  hora_termino: string;
  zona: any;
  estado: 'Planificado' | 'En curso' | 'Finalizado' | string;
}
