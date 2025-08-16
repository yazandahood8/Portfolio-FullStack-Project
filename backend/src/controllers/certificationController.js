import certificationModel from '../models/certificationModel.js';
import { certificationSchema } from '../validators/certificationValidators.js';

export const getCertifications = async (req, res, next) => {
  try {
    const certs = await certificationModel.getAllByUser(req.params.id);
    res.json({ success: true, data: certs });
  } catch (err) { next(err); }
};

export const createCertification = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    const { error, value } = certificationSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    const cert = await certificationModel.create(req.params.id, value);
    res.status(201).json({ success: true, data: cert, message: 'Certification added.' });
  } catch (err) { next(err); }
};

export const updateCertification = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    const { error, value } = certificationSchema.validate(req.body);
    if (error) return res.status(400).json({ success: false, message: error.details[0].message });
    const cert = await certificationModel.update(req.params.id, req.params.certificationId, value);
    res.json({ success: true, data: cert, message: 'Certification updated.' });
  } catch (err) { next(err); }
};

export const deleteCertification = async (req, res, next) => {
  try {
    if (req.user.id !== req.params.id) return res.status(403).json({ success: false, message: 'Forbidden' });
    await certificationModel.delete(req.params.id, req.params.certificationId);
    res.json({ success: true, message: 'Certification deleted.' });
  } catch (err) { next(err); }
};
