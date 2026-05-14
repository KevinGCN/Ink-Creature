export interface Schedule {
  start: string;
  end: string;
  days: string[];
}

export interface Empleado {
    id: number;
    name: string;
    last_name: string;
    email: string;
    password: string;
    phone: string;
    charge: string;
    schedule?: Schedule;
}
