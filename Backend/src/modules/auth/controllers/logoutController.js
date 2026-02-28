import { LOGOUT_SUCCESS_MESSAGE } from '../../../constants/index.js';

const logoutController = (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ success: true, message: LOGOUT_SUCCESS_MESSAGE });
};

export default logoutController;
