import express from 'express';

const Clientrouter = express.Router();

import {
  createClient,getAllClients,getClientById,updateClient,deleteClient
} from '../controllers/clientController.ts';

Clientrouter.post('/',createClient);
Clientrouter.get('/',getAllClients);
Clientrouter.get('/:id',getClientById);
Clientrouter.put('/:id',updateClient);
Clientrouter.delete('/:id',deleteClient);

export default Clientrouter;