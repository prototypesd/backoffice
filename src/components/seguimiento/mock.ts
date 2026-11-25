// Datos de prueba para KIVO-WEB-001-2026-LP. Reemplazar por la respuesta de la API.
// Los requisitos son ejemplos: el documento v5 todavía no define la lista (HU-16).
import type { FluEvento, Requisito } from './seguimiento.config';

export const historialMock: FluEvento[] = [
  { codigo: 'FLU-001', estado: 'EN_REVISION_GESTOR_CLIENTES', rol: 'Gestor de Clientes', actorNombre: 'Gestor de Clientes 1', fecha: '2026-11-19T08:40:00-04:00' },
  { codigo: 'FLU-006', estado: 'PREAPROBADO', rol: 'Gestor de Clientes', actorNombre: 'Gestor de Clientes 1', fecha: '2026-11-19T09:10:00-04:00', motivo: 'Identidad, BIC y reporte de buró conformes.' },
  { codigo: 'FLU-008', estado: 'EN_REVISION_PRELIMINAR', rol: 'Gestor de Préstamo', fecha: '2026-11-20T10:05:00-04:00' },
  { codigo: 'FLU-010', estado: 'ASESOR_ASIGNADO', rol: 'Gestor de Préstamo', fecha: '2026-11-20T11:30:00-04:00', motivo: 'Asignado a Asesor 1.' },
  { codigo: 'FLU-011', estado: 'EN_CONFIRMACION_DATOS', rol: 'Asesor de Préstamos', actorNombre: 'Asesor 1', fecha: '2026-11-21T09:51:00-04:00' },
  { codigo: 'FLU-012', estado: 'OBSERVADO_CONFIRMACION', rol: 'Asesor de Préstamos', actorNombre: 'Asesor 1', fecha: '2026-11-21T15:20:00-04:00', motivo: 'Llamada: el ingreso declarado no coincide con la boleta.' },
  { codigo: 'FLU-011', estado: 'EN_CONFIRMACION_DATOS', rol: 'Asesor de Préstamos', actorNombre: 'Asesor 1', fecha: '2026-11-22T10:02:00-04:00', motivo: 'Cliente corrigió el ingreso. Subsanado.' },
  { codigo: 'FLU-013', estado: 'REQUISITOS_PENDIENTES', rol: 'Asesor de Préstamos', actorNombre: 'Asesor 1', fecha: '2026-11-23T16:05:00-04:00' },
];

export const requisitosMock: Requisito[] = [
  { nombre: 'Boletas de pago (3 meses)', estado: 'aceptado', subidoPor: 'cliente' },
  { nombre: 'Factura de luz', estado: 'aceptado', subidoPor: 'asesor' },
  { nombre: 'Certificado AFP', estado: 'aceptado', subidoPor: 'cliente' },
  { nombre: 'Extracto bancario', estado: 'observado', subidoPor: 'cliente', observacion: 'Ilegible' },
  { nombre: 'Documento del garante', estado: 'pendiente' },
];
