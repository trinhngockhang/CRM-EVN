import { Router } from 'express';
import * as controller from './UserController';
import { throwAsNext } from '../../middleware';

const path = '/users';
const router = Router();

router.get('/payment', throwAsNext(controller.getPayment));
export default { path, router };
