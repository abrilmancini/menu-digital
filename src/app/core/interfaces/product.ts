export interface Product {
    id: number;
    nombre: string;
    descripcion: string;
    precio: number;
    precioHappyHour: number;
    imagenUrl: string;
    isDestacado: boolean;
    isHappyHour: boolean; // Este booleano es clave para tu lógica automática
    categoriaId: number;
}