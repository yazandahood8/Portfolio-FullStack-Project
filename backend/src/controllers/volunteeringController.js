import volunteeringModel from '../models/volunteeringModel.js';
import { volunteeringSchema } from '../validators/volunteeringValidators.js';

const getParamUserId = (req) => req.params.userId ?? req.params.user_id ?? req.params.id;
const getParamVolunteeringId = (req) => req.params.volunteeringId ?? req.params.id;

export const getVolunteerings = async (req, res, next) => {
  try {
    const userId = getParamUserId(req);
    const volunteerings = await volunteeringModel.getAllByUser(userId);
    res.json({ success: true, data: volunteerings });
  } catch (err) { next(err); }
};

export const createVolunteering = async (req, res, next) => {
  try {
    console.log('VOL POST params:', req.params);
console.log('VOL POST user.id:', req.user?.id);
console.log('VOL POST compare:', String(req.user?.id), 'vs', String(req.params.userId ?? req.params.user_id));
    const userId = getParamUserId(req);

    // בדיקת בעלות – השוואה כמחרוזות מול המזהה המנורמל
    if (String(req.user?.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { error, value } = volunteeringSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const v = await volunteeringModel.create(userId, value);
    res.status(201).json({ success: true, data: v, message: 'Volunteering added.' });
  } catch (err) { next(err); }
};

export const updateVolunteering = async (req, res, next) => {
  try {
    const userId = getParamUserId(req);
    const volunteeringId = getParamVolunteeringId(req);

    if (String(req.user?.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const { error, value } = volunteeringSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ success: false, message: error.details[0].message });
    }

    const v = await volunteeringModel.update(userId, volunteeringId, value);
    res.json({ success: true, data: v, message: 'Volunteering updated.' });
  } catch (err) { next(err); }
};

export const deleteVolunteering = async (req, res, next) => {
  try {
    const userId = getParamUserId(req);
    const volunteeringId = getParamVolunteeringId(req);

    if (String(req.user?.id) !== String(userId)) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    await volunteeringModel.delete(userId, volunteeringId);
    res.json({ success: true, message: 'Volunteering deleted.' });
  } catch (err) { next(err); }
};
