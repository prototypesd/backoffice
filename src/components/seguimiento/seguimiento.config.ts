// Mapeo de pasos y subpasos del expediente a los estados FLU
// (Anexo B del documento de requisitos KIVO v5).

export type FluCodigo = `FLU-${string}`;

export interface FluEvento {
  codigo: FluCodigo;          // ej. "FLU-012"
  estado: string;             // ej. "OBSERVADO_CONFIRMACION"
  rol: string;                // ej. "Asesor de Préstamos"
  actorNombre?: string;       // ej. "María Quispe"
  fecha: string;              // ISO
  motivo?: string;            // comentario o motivo de la transición
}

export type EstadoRequisito = 'pendiente' | 'recibido' | 'observado' | 'aceptado';

export interface Requisito {
  nombre: string;
  estado: EstadoRequisito;
  subidoPor?: 'cliente' | 'asesor';
  observacion?: string;
}

export interface SubpasoDef {
  id: string;
  titulo: string;
  responsable: string;
  codigos: FluCodigo[];
}

export interface PasoDef {
  numero: number;
  titulo: string;
  descripcion: string;
  subpasos: SubpasoDef[];
}

const rango = (desde: number, hasta: number): FluCodigo[] =>
  Array.from({ length: hasta - desde + 1 }, (_, i) =>
    `FLU-${String(desde + i).padStart(3, '0')}` as FluCodigo,
  );

export const PASOS: PasoDef[] = [
  {
    numero: 1,
    titulo: 'Solicitud recibida',
    descripcion: 'Revisión inicial del Gestor de Clientes.',
    subpasos: [
      { id: 'revision-gc', titulo: 'Revisión y validaciones', responsable: 'Gestor de Clientes', codigos: rango(1, 5) },
      { id: 'preaprobacion', titulo: 'Preaprobación y derivación', responsable: 'Gestor de Clientes', codigos: rango(6, 7) },
    ],
  },
  {
    numero: 2,
    titulo: 'Asignación de asesor',
    descripcion: 'Revisión preliminar y asignación.',
    subpasos: [
      { id: 'revision-preliminar', titulo: 'Revisión preliminar', responsable: 'Gestor de Préstamo', codigos: rango(8, 9) },
      { id: 'asesor-asignado', titulo: 'Asesor asignado', responsable: 'Gestor de Préstamo', codigos: ['FLU-010'] },
    ],
  },
  {
    numero: 3,
    titulo: 'En evaluación',
    descripcion: 'Requisitos, carpeta, visita y comité.',
    subpasos: [
      { id: 'confirmacion', titulo: 'Confirmación de datos con el cliente', responsable: 'Asesor', codigos: rango(11, 12) },
      { id: 'requisitos', titulo: 'Requisitos', responsable: 'Asesor + Cliente', codigos: rango(13, 14) },
      { id: 'evaluacion', titulo: 'Carpeta y evaluación socioeconómica', responsable: 'Asesor', codigos: ['FLU-015'] },
      { id: 'revision-escalonada', titulo: 'Revisión Gerencia → Gestor de Préstamo', responsable: 'Gerente de Operaciones / Gestor de Préstamo', codigos: rango(16, 19) },
      { id: 'visita', titulo: 'Visita domiciliaria', responsable: 'Control Interno', codigos: rango(20, 24) },
      { id: 'resultado-visita', titulo: 'Resultado de la visita', responsable: 'Asesor', codigos: ['FLU-025'] },
      { id: 'comite', titulo: 'Comité de préstamos', responsable: 'Gestor de Préstamo + Gerente de Operaciones', codigos: rango(26, 30) },
    ],
  },
  {
    numero: 4,
    titulo: 'Firma de contrato',
    descripcion: 'Contrato, revisión legal y Notaría.',
    subpasos: [
      { id: 'contrato', titulo: 'Elaboración del contrato', responsable: 'Asesor', codigos: ['FLU-031'] },
      { id: 'legal', titulo: 'Revisión legal', responsable: 'Legal', codigos: rango(32, 34) },
      { id: 'notaria-envio', titulo: 'Envío a Notaría', responsable: 'Asesor', codigos: ['FLU-035'] },
      { id: 'firma', titulo: 'Firma en Notaría', responsable: 'Cliente + Notaría', codigos: ['FLU-036'] },
      { id: 'evidencia-firma', titulo: 'Carga del reconocimiento de firmas', responsable: 'Asesor', codigos: ['FLU-037'] },
    ],
  },
  {
    numero: 5,
    titulo: 'Desembolso',
    descripcion: 'Expediente final y transferencia.',
    subpasos: [
      { id: 'preparacion', titulo: 'Preparación del expediente', responsable: 'Asesor', codigos: ['FLU-038'] },
      { id: 'control-final', titulo: 'Control final', responsable: 'Gestor de Préstamo', codigos: rango(39, 40) },
      { id: 'desembolsado', titulo: 'Desembolso confirmado', responsable: 'Gestor de Préstamo', codigos: ['FLU-041'] },
    ],
  },
];

// Estados que cierran el expediente por rechazo.
export const CODIGOS_RECHAZO: FluCodigo[] = ['FLU-007', 'FLU-030'];
