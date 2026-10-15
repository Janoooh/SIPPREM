import type {Request, Response} from "express";
import {poolDb} from "../config/db.js";
import { Query } from "pg";
import * as vehiculoServices from "../services/vehiculo.services.js";

//esto esta total geminiao
export const verVehiculos = async (req: Request, res: Response) => {
  try {
    const vehiculos = await vehiculoServices.verVehiculos();
    return res.status(200).json(vehiculos);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const verVehiculoID = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const vehiculo = await vehiculoServices.verVehiculoID(String(id));
    if (vehiculo == null) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    return res.status(200).json(vehiculo);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const agregarVehiculo = async (req: Request, res: Response) => {
  try {
    const {id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo} = req.body;
    const nuevoVehiculo = await vehiculoServices.agregarVehiculo(id_item, id_proyecto, nombre_vehiculo, id_tipo_vehiculo);
    return res.status(201).json(nuevoVehiculo);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};

export const borrarVehiculo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const eliminado = await vehiculoServices.borrarVehiculo(String(id));
    if (!eliminado) {
      return res.status(404).json({ message: 'Vehículo no encontrado' });
    }
    return res.status(200).json({ message: 'Vehículo eliminado con éxito', eliminado });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
};