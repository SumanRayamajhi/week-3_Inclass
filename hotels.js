const secrets = require("./secrets.json");
const { Pool } = require("pg");
const connection = new Pool(secrets);

// get all hotels
const getAllHotels = async (req, res) => {
  try {
    const hotelNameQuery = req.query.name;
    let query = `select * from hotels order by name`;
    if (hotelNameQuery) {
      query = `select * from hotels where name like '%${hotelNameQuery}%' order by name`;
    }
    const hotelResult = await connection.query(query);
    res.status(200).send(hotelResult.rows);
  } catch (err) {
    console.log(err);
  }
};

//create new hotel
const createNewHotel = async (req, res) => {
  try {
    const newHotelName = req.body.name;
    const newHotelRooms = req.body.rooms;
    const newHotelPostcode = req.body.postcode;

    if (!Number.isInteger(newHotelRooms) || newHotelRooms <= 0) {
      return res
        .status(400)
        .send("The number of rooms should be a positive integer.");
    }
    const result = await connection.query(
      "SELECT * FROM hotels WHERE name=$1",
      [newHotelName]
    );
    if (result.rows.length > 0) {
      return res
        .status(400)
        .send("An hotel with the same name already exists!");
    } else {
      const query =
        "INSERT INTO hotels (name, rooms, postcode) VALUES ($1, $2, $3) returning id";
      const insertResult = await connection.query(query, [
        newHotelName,
        newHotelRooms,
        newHotelPostcode,
      ]);
      const responseBody = { hotelId: insertResult.rows[0].id };
      res.status(201).json(responseBody);
    }
  } catch (err) {
    console.log(err);
  }
};

// get end point with hotel Id
const getHotelById = async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    if (!Number.isInteger(hotelId) || hotelId <= 0) {
      return res.status(400).send("Hotel is empty or is negative value!");
    }
    const result = await connection.query(
      `select * from hotels h
              where h.id=$1`,
      [hotelId]
    );
    res.status(200).json(result.rows);
  } catch (err) {
    console.log(err);
  }
};

//Add a new DELETE endpoint /hotels/:hotelId to delete a specific hotel.
//A hotel can only be deleted if it doesn't appear in any of the customers' bookings!
//Make sure you add the corresponding validation before you try to delete a hotel.

const deleteHotelById = async (req, res) => {
  try {
    const hotelId = req.params.hotelId;
    const hotelQuery = `select * from bookings where hotel_id=$1`;

    const findBookings = await connection.query(hotelQuery, [hotelId]);

    const bookings = findBookings.rows;
    if (bookings.length > 0) {
      res.status(400).send(`Hotel id: ${hotelId} has bookings!`);
    } else {
      const deleteBookingQuery = `delete from bookings where hotel_id=$1`;
      const deleteHotelQuery = `delete from hotels where id=$1`;

      await connection.query(deleteBookingQuery, [hotelId]);
      await connection.query(deleteHotelQuery, [hotelId]);
      res
        .status(200)
        .send(`Hotel id: ${hotelId} has been deleted sucessfully! `);
    }
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getAllHotels,
  createNewHotel,
  getHotelById,
  deleteHotelById,
};
