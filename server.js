const express = require("express");
const app = express();
const PORT = 3000;
const {
  getAllHotels,
  createNewHotel,
  getHotelById,
  deleteHotelById,
} = require("./hotels");
const {
  getAllCustomer,
  getCustomerById,
  creatNewCustomer,
  getBookingBySpecipicCustomerId,
  updateCustomerInfo,
  deleteCustomerById,
} = require("./customer");
const bodyParser = require("body-parser");
app.use(bodyParser.json());

app.get("/hotels", getAllHotels);
app.post("/hotels", createNewHotel);
app.get("/hotels/:hotelId", getHotelById);
app.delete("/hotels/:hotelId", deleteHotelById);

app.get("/customers", getAllCustomer);
app.get("/customers/:customerId", getCustomerById);
app.get("/customers/:customerId/bookings", getBookingBySpecipicCustomerId);
// app.patch("/customers/:customerId", updateCustomerEmail);
app.patch("/customers/:customerId", updateCustomerInfo);
app.post("/customers", creatNewCustomer);
app.delete("/customers/:customerId", deleteCustomerById);

app.listen(PORT, function () {
  console.log("Server is listening on port 3000. Ready to accept requests!");
});
