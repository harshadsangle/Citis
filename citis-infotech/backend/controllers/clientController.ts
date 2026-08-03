import Client from '../models/Client';
import { crudController } from '../utils/crud';

const crud = crudController(Client, {
  searchFields: ['name'],
  filterFields: ['featured'],
  sort: 'order -createdAt',
  allowedFields: ['name', 'logo', 'website', 'featured', 'order'],
});

export const getClients = crud.list;
export const getClient = crud.get;
export const createClient = crud.create;
export const updateClient = crud.update;
export const deleteClient = crud.remove;
