import Contact from '../models/Contact';
import { sendContactNotification } from '../services/emailService';
import { successResponse } from '../utils/apiResponse';
import { asyncHandler, crudController } from '../utils/crud';
import { AppError } from '../middleware/errorHandler';

const crud = crudController(Contact, {
  searchFields: ['name', 'email', 'subject', 'message'],
  filterFields: ['status'],
  allowedFields: ['status'],
});

export const getContacts = crud.list;
export const deleteContact = crud.remove;

export const createContact = asyncHandler(async (req, res) => {
  const contact = await Contact.create({
    name: req.body.name, email: req.body.email, phone: req.body.phone,
    subject: req.body.subject, message: req.body.message,
  });
  void sendContactNotification(contact).catch((error) => console.error('Contact email failed:', error.message));
  return successResponse(res, contact, 'Message sent', 201);
});

export const updateContact = asyncHandler(async (req, res) => {
  const status = req.body.status;
  if (!['new', 'read', 'replied'].includes(status)) throw new AppError('Invalid status', 422);
  const contact = await Contact.findByIdAndUpdate(req.params.id, {
    status, ...(status === 'replied' ? { repliedAt: new Date() } : {}),
  }, { new: true, runValidators: true });
  if (!contact) throw new AppError('Contact not found', 404);
  return successResponse(res, contact, 'Contact updated');
});
