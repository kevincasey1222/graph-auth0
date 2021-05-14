import { accountSteps } from './account';
import { userSteps } from './users';
import { clientSteps } from './clients';

const integrationSteps = [...accountSteps, ...userSteps, ...clientSteps];

export { integrationSteps };
