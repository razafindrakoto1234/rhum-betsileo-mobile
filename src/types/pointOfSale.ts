// src/types/pointOfSale.ts

export type PointOfSaleStatus = "ACTIVE" | "INACTIVE";

export interface PointOfSaleData {
  idPOS: string;
  name: string;
  location?: string;
  status: PointOfSaleStatus;
  idUser?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePointOfSaleInput {
  name: string;
  location?: string;
  idUser?: string;
  status?: PointOfSaleStatus;
}
