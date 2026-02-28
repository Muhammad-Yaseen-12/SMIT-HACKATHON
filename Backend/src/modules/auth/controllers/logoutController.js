import { LOGOUT_SUCCESS_MESSAGE } from '../../../constants/index.js';

const logoutController = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('token', {
        httpOnly: true,
        signed: true,
        secure: isProduction,
        sameSite: isProduction ? 'None' : 'Lax',
    });
    res.status(200).json({ success: true, message: LOGOUT_SUCCESS_MESSAGE });
};

export default logoutController;
