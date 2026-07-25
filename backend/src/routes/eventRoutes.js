import express from "express";
import {createEvent, getAllEvents, getEventById, updateEvent, deleteEvent} from '../controllers/EventController.js'

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router;
