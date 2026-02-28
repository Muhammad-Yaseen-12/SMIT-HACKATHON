import UserModel from "../../../models/UserModel.js";

const getAll = async () => await UserModel.find();

const addData = (data) =>
    new UserModel(data).save().then((user) => user.toObject());

const deleteById = async (id) => await UserModel.findByIdAndDelete(id);

const updateById = async (id, data) => await UserModel.findByIdAndUpdate(id, data, { new: true });
const findByEmail = async (email) => await UserModel.findOne({ email });


export {
    getAll,
    addData,
    deleteById,
    updateById,
    findByEmail
}