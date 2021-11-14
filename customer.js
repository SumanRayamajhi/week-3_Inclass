const secrets = require("./secrets.json");
const { Pool } = require("pg");
const { request } = require("express");
const connection = new Pool(secrets);

// Add a new GET endpoint /customers to load all customers ordered by name.
const getAllCustomer = async (req, res) => {
  try {
    let customerNameQuery = `select * from customers order by name`;
    const result = await connection.query(customerNameQuery);
    res.status(200).send(result.rows);
  } catch (err) {
    console.log(err);
  }
};

//Add a new GET endpoint /customers/:customerId to load one customer by ID.
const getCustomerById = async (req, res) => {
  try {
    const customerId = req.params.customerId;

    if (!Number.isInteger(customerId) || customerId <= 0) {
      return res
        .status(400)
        .send("There is no customers with the following id!");
    } else {
      const customerIdQuery = await connection.query(
        `select * from customers c
              where c.id=$1`,
        [customerId]
      );
      res.status(200).send(customerIdQuery.rows);
    }
  } catch (err) {
    console.log(err);
  }
};

//Add a new POST API endpoint to create a new customer in the customers table.
const creatNewCustomer = async (req, res) => {
  try {
    const newCustomerName = req.body.name;
    const newCustomerEmail = req.body.email;
    const newCustomerAddress = req.body.address;
    const newCustomerCity = req.body.city;
    const newCustomerPostcode = req.body.postcode;
    const newCustomerCountry = req.body.country;

    const result = await connection.query(
      "select * from customers where name=$1",
      [newCustomerName]
    );
    if (result.rows.length > 0) {
      return res.status(400).send("Name is already exist!");
    } else {
      const query =
        "insert into customers (name, email, address, city, postcode, country) values ($1, $2, $3, $4, $5, $6) returning id";
      const insertResult = await connection.query(query, [
        newCustomerName,
        newCustomerEmail,
        newCustomerAddress,
        newCustomerCity,
        newCustomerPostcode,
        newCustomerCountry,
      ]);
      const responseBody = { CustomerId: insertResult.rows[0].id };
      res.status(201).json(responseBody);
    }
  } catch (err) {
    console.log(err);
  }
};

// Add a new GET endpoint /customers/:customerId/bookings to load all the bookings of a specific customer.
// Returns the following information: check in date, number of nights, hotel name, hotel postcode, custumer name.

const getBookingBySpecipicCustomerId = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const customerIdQuery = await connection.query(
      `select b.checkin_date, b.nights, h.name, h.postcode, c.name from bookings b
        inner join hotels h on h.id=b.hotel_id
        inner join customers c on c.id=b.customer_id
        where c.id=$1`,
      [customerId]
    );
    res.status(200).send(customerIdQuery.rows);
  } catch (err) {
    console.log(err);
  }
};
//Add the PATCH endpoint /customers/:customerId and verify you can update a customer email using Postman.
//Add validation for the email before updating the customer record in the database. If the email is empty, return an error message.
// const updateCustomerEmail = async (req, res) => {
//   try {
//     const customerId = req.params.customerId;
//     const newEmail = req.body.email;
//     if (newEmail.length > 0) {
//       await connection.query(`update customers set email=$1 where id=$2`, [
//         newEmail,
//         customerId,
//       ]);
//       res.status(200).send(`Customer ${customerId} updated!`);
//     } else {
//       return res.send("Email is empty!");
//     }
//   } catch (err) {
//     console.log(err);
//   }
// };

//Update customer's information
const replaceCustomerValues = (customer, newCustomer) => {
  // replace only the fields comming from newCustomer ...^
  // newCustomer does not have all the fields!
  //customer = {id: 1, email: '', ...}
  let updatedCustomer = {}; // creating the same object as customer
  for (const propertyName in customer) {
    updatedCustomer[propertyName] = customer[propertyName];
  }
  for (const propertyName in newCustomer) {
    // ONLY filling the properties that come from newCustomer
    updatedCustomer[propertyName] = newCustomer[propertyName];
  }

  return updatedCustomer;
};
const getCustomerFromDatabase = async (customerId) => {
  const result = await connection.query(`SELECT * FROM customers WHERE id=$1`, [
    customerId,
  ]);
  const dbCustomer = result.rows[0];
  return dbCustomer;
};

const updateCustomerInfo = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    const requestCustomer = req.body;

    const dbCustomer = await getCustomerFromDatabase(customerId);
    const customer = replaceCustomerValues(dbCustomer, requestCustomer);

    await connection.query(
      `UPDATE customers SET email=$1, address=$2, city=$3, postcode=$4, country=$5, name=$6 WHERE id=$7`,
      [
        customer.email,
        customer.address,
        customer.city,
        customer.postcode,
        customer.country,
        customer.name,
        customer.id,
      ]
    );
    res.status(202).send(`Customer ${customerId} updated`);
  } catch (err) {
    console.log(err);
  }
};

//Deleting customer by their Id
const deleteCustomerById = async (req, res) => {
  try {
    const customerId = req.params.customerId;
    await connection.query(`delete from bookings where customer_id=$1`, [
      customerId,
    ]);
    await connection.query(`delete from customers where id=$1`, [customerId]);
    res.status(200).send(`Customer ${customerId} deleted!`);
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getAllCustomer,
  getCustomerById,
  creatNewCustomer,
  getBookingBySpecipicCustomerId,
  updateCustomerInfo,
  deleteCustomerById,
};
