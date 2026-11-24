/* Datos demo del onboarding (sin peticiones) */

export const STEPS = [
  { title: "Tus datos", field: "Nombre completo" },
  { title: "Tus finanzas", field: "Ingreso mensual" },
  { title: "Elige tu préstamo", field: "Monto solicitado" },
  { title: "Más sobre ti", field: "Tipo de vivienda" },
  { title: "Tus documentos", field: "Selfie del cliente" },
  { title: "Resumen", field: "Confirmación final" },
];

export type OnbClient = {
  id: string;
  name: string;
  ci: string;
  email: string;
  phone: string;
  canal: "Oficina" | "Web" | "App";
  origen: string;
  city: string;
  tipo: "Asalariado" | "Dependiente";
  amount: string;
  step: number;
  daysInStep: number;
  inicio: string;
  ultimoDato: string;
  ultimoEn: string;
};

export const CLIENTS: OnbClient[] = [
  {
    id: "hugo-soliz",
    name: "Hugo Soliz",
    ci: "3452345435",
    email: "hugo.soliz@example.com",
    phone: "73080594",
    canal: "Oficina",
    origen: "—",
    city: "La Paz",
    tipo: "Asalariado",
    amount: "—",
    step: 1,
    daysInStep: 1,
    inicio: "20/11/2026 19:26",
    ultimoDato: "Nombre completo",
    ultimoEn: "Hace 1 día",
  },
  {
    id: "maria-quisbert",
    name: "María Quisbert",
    ci: "6781122",
    email: "maria.quisbert@example.com",
    phone: "70123456",
    canal: "Web",
    origen: "—",
    city: "Cochabamba",
    tipo: "Dependiente",
    amount: "Bs 8.000",
    step: 3,
    daysInStep: 2,
    inicio: "18/11/2026 10:04",
    ultimoDato: "Monto solicitado",
    ultimoEn: "Hace 2 días",
  },
  {
    id: "pedro-mamani",
    name: "Pedro Mamani",
    ci: "9088776",
    email: "pedro.mamani@example.com",
    phone: "71234567",
    canal: "App",
    origen: "—",
    city: "Santa Cruz",
    tipo: "Asalariado",
    amount: "Bs 15.000",
    step: 5,
    daysInStep: 0,
    inicio: "23/11/2026 08:41",
    ultimoDato: "Carnet de identidad (anverso)",
    ultimoEn: "Hace 3 horas",
  },
  {
    id: "lucia-flores",
    name: "Lucía Flores",
    ci: "4455667",
    email: "lucia.flores@example.com",
    phone: "72345678",
    canal: "Web",
    origen: "—",
    city: "La Paz",
    tipo: "Dependiente",
    amount: "Bs 5.000",
    step: 1,
    daysInStep: 8,
    inicio: "08/11/2026 09:15",
    ultimoDato: "Número de celular",
    ultimoEn: "Hace 8 días",
  },
  {
    id: "jorge-terrazas",
    name: "Jorge Terrazas",
    ci: "3322110",
    email: "jorge.terrazas@example.com",
    phone: "73456789",
    canal: "Oficina",
    origen: "—",
    city: "La Paz",
    tipo: "Asalariado",
    amount: "—",
    step: 2,
    daysInStep: 4,
    inicio: "15/11/2026 16:20",
    ultimoDato: "Ingreso mensual",
    ultimoEn: "Hace 4 días",
  },
];

/* ───────── Detalle demo por cliente (mismos campos que el expediente) ─────────
   paso: a partir de qué paso del onboarding el dato ya fue ingresado. */

export type Detail = {
  personal: {
    nombre: string; ci: string; nacimiento: string; genero: string;
    celular: string; ciudad: string; direccion: string; estadoCivil: string; dependientes: string;
  };
  financiera: {
    actividad: string; ingreso: string; otrasFuentes: string; deudas: string;
    atrasadas: boolean; extractos: boolean; entidad: string;
  };
  prestamo: { monto: string; plazo: string; cuota: string; tasa: string; destino: string; total: string; cuotaIngreso: string };
  adicional: {
    empresa: string; rubro: string; ocupacion: string; direccion: string;
    antiguedad: string; nit: boolean; vivienda: string; proposito: string;
  };
};

export const DETAILS: Record<string, Detail> = {
  "hugo-soliz": {
    personal: {
      nombre: "Hugo Soliz",
      ci: "3452345435",
      nacimiento: "20/02/2000",
      genero: "Hombre",
      celular: "73080594",
      ciudad: "La Paz",
      direccion: "Av. Hector Ormachea 5362, La Paz",
      estadoCivil: "Soltero",
      dependientes: "4",
    },
    financiera: {
      actividad: "Asalariado",
      ingreso: "Bs 5.000",
      otrasFuentes: "Sí · Bs 100 (Alquiler)",
      deudas: "Bs 200/mes · Banco Demo",
      atrasadas: false,
      extractos: true,
      entidad: "BCP",
    },
    prestamo: {
      monto: "Bs 30.000",
      plazo: "18",
      cuota: "Bs 2.262",
      tasa: "3 %",
      destino: "Capital de trabajo",
      total: "Bs 40.716",
      cuotaIngreso: "44 %",
    },
    adicional: {
      empresa: "SoyDigitalPagos",
      rubro: "Industria",
      ocupacion: "Control",
      direccion: "Av. Hector Ormachea 5390, La Paz",
      antiguedad: "34 meses",
      nit: false,
      vivienda: "Propia",
      proposito: "Compra de mercadería",
    },
  },
  "maria-quisbert": {
    personal: {
      nombre: "María Quisbert",
      ci: "6781122",
      nacimiento: "14/07/1988",
      genero: "Mujer",
      celular: "70123456",
      ciudad: "Cochabamba",
      direccion: "Calle Jordán 1234, Cochabamba",
      estadoCivil: "Casada",
      dependientes: "2",
    },
    financiera: {
      actividad: "Dependiente",
      ingreso: "Bs 4.200",
      otrasFuentes: "Sí · Bs 300 (Ventas)",
      deudas: "Bs 350/mes · Banco Demo",
      atrasadas: false,
      extractos: true,
      entidad: "Bisa",
    },
    prestamo: {
      monto: "Bs 8.000",
      plazo: "6",
      cuota: "Bs 1.488",
      tasa: "3 %",
      destino: "Capital de trabajo",
      total: "Bs 8.928",
      cuotaIngreso: "35 %",
    },
    adicional: {
      empresa: "Tienda Quisbert",
      rubro: "Comercio",
      ocupacion: "Propietaria",
      direccion: "Av. América 456, Cochabamba",
      antiguedad: "60 meses",
      nit: true,
      vivienda: "Alquilada",
      proposito: "Compra de mercadería",
    },
  },
  "pedro-mamani": {
    personal: {
      nombre: "Pedro Mamani",
      ci: "9088776",
      nacimiento: "02/03/1995",
      genero: "Hombre",
      celular: "71234567",
      ciudad: "Santa Cruz",
      direccion: "4º Anillo 789, Santa Cruz",
      estadoCivil: "Casado",
      dependientes: "1",
    },
    financiera: {
      actividad: "Asalariado",
      ingreso: "Bs 9.500",
      otrasFuentes: "Sí · Bs 500 (Alquiler)",
      deudas: "Bs 800/mes · BCP",
      atrasadas: false,
      extractos: true,
      entidad: "BCP",
    },
    prestamo: {
      monto: "Bs 15.000",
      plazo: "18",
      cuota: "Bs 1.131",
      tasa: "3 %",
      destino: "Compra de vehículo",
      total: "Bs 20.358",
      cuotaIngreso: "12 %",
    },
    adicional: {
      empresa: "AgroMamani S.R.L.",
      rubro: "Agroindustria",
      ocupacion: "Supervisor",
      direccion: "Doble Vía La Guardia km 8, Santa Cruz",
      antiguedad: "72 meses",
      nit: true,
      vivienda: "Propia",
      proposito: "Compra de vehículo",
    },
  },
  "lucia-flores": {
    personal: {
      nombre: "Lucía Flores",
      ci: "4455667",
      nacimiento: "11/09/1992",
      genero: "Mujer",
      celular: "72345678",
      ciudad: "La Paz",
      direccion: "Calle 21 3456, La Paz",
      estadoCivil: "Soltera",
      dependientes: "0",
    },
    financiera: {
      actividad: "Dependiente",
      ingreso: "Bs 3.000",
      otrasFuentes: "No",
      deudas: "Bs 120/mes · Banco Demo",
      atrasadas: false,
      extractos: false,
      entidad: "—",
    },
    prestamo: {
      monto: "Bs 5.000",
      plazo: "6",
      cuota: "Bs 930",
      tasa: "3 %",
      destino: "Capital de trabajo",
      total: "Bs 5.580",
      cuotaIngreso: "31 %",
    },
    adicional: {
      empresa: "Boutique Lucía",
      rubro: "Comercio",
      ocupacion: "Propietaria",
      direccion: "Calle Linares 78, La Paz",
      antiguedad: "24 meses",
      nit: false,
      vivienda: "De sus padres",
      proposito: "Compra de mercadería",
    },
  },
  "jorge-terrazas": {
    personal: {
      nombre: "Jorge Terrazas",
      ci: "3322110",
      nacimiento: "30/05/1985",
      genero: "Hombre",
      celular: "73456789",
      ciudad: "La Paz",
      direccion: "Av. Ballivián 9012, La Paz",
      estadoCivil: "Divorciado",
      dependientes: "3",
    },
    financiera: {
      actividad: "Asalariado",
      ingreso: "Bs 6.800",
      otrasFuentes: "No",
      deudas: "Bs 450/mes · Bisa",
      atrasadas: true,
      extractos: true,
      entidad: "Bisa",
    },
    prestamo: {
      monto: "Bs 20.000",
      plazo: "12",
      cuota: "Bs 2.004",
      tasa: "3 %",
      destino: "Mejora de vivienda",
      total: "Bs 24.048",
      cuotaIngreso: "29 %",
    },
    adicional: {
      empresa: "Constructora Andina",
      rubro: "Construcción",
      ocupacion: "Maestro mayor de obras",
      direccion: "Av. Groneman 234, El Alto",
      antiguedad: "120 meses",
      nit: true,
      vivienda: "Propia",
      proposito: "Mejora de vivienda",
    },
  },
};
