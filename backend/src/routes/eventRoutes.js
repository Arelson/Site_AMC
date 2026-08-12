import express from "express";
import {createEvent, getAllEvents, getEventById, updateEvent, deleteEvent, registerForEvent, exportRegistrations} from '../controllers/EventController.js'

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);
router.post('/:id/register', registerForEvent);
router.get('/:id/export', exportRegistrations); // Rota do Admin

export default router;
