import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    line1: {
        type: String,
        required: true
    },
    line2: {
        type: String
    },
    city: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    }
});

const Address = mongoose.model("Address", addressSchema);

export default Address;