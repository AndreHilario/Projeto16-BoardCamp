import { db } from "../database/database.js";

export async function getCustomers(req, res) {

    const { cpf, order, desc } = req.query;

    try {

        let customers;
        let queryString = `SELECT * FROM customers`;

        if (cpf) {
            queryString += ` WHERE cpf LIKE $1`;
            if (order) {
                queryString += ` ORDER BY "${order}"`;
                if (desc && desc.toLowerCase() === "true") {
                    queryString += ` DESC`;
                }
            }
            customers = await db.query(queryString, [`${cpf}%`]);
        } else {
            if (order) {
                queryString += ` ORDER BY "${order}"`;
                if (desc && desc.toLowerCase() === "true") {
                    queryString += ` DESC`;
                }
            }
            customers = await db.query(queryString);
        }

        res.send(customers.rows);

    } catch (err) {
        res.status(500).send(err.message);
    }

};

export async function getCustomersById(req, res) {

    const { id } = req.params;

    if (!id) return res.status(400).send("The id parameter is mandatory");

    try {

        const customerById = await db.query(`SELECT * FROM customers WHERE id = $1;`, [id]);

        if (customerById.rows.length === 0) return res.sendStatus(404);

        res.send(customerById.rows[0]);

    } catch (err) {
        res.status(500).send(err.message);
    }

};

export async function postCustomers(req, res) {

    const { name, phone, cpf, birthday } = req.body;

    const formattedDatePost = birthday.format("YYYY-MM-DD");

    try {

        const existingCpf = await db.query(`SELECT * FROM customers WHERE cpf = $1;`, [cpf]);

        if (existingCpf.rowCount > 0) return res.status(409).send("CPF already exist");

        await db.query(`INSERT INTO customers ("name", "phone", "cpf", "birthday") VALUES ($1, $2, $3, $4);`, [name, phone, cpf, formattedDatePost]);

        res.sendStatus(201);

    } catch (err) {
        res.status(500).send(err.message);
    }

};

export async function editCustomers(req, res) {

    const { name, phone, cpf, birthday } = req.body;
    const { id } = req.params;

    const formattedDateEdit = birthday.format("YYYY-MM-DD");

    if (!id) return res.status(400).send("The id parameter is mandatory");

    try {

        const existingCustomer = await db.query(`SELECT * FROM customers WHERE cpf = $1 AND id <> $2;`, [cpf, id]);
        if (existingCustomer.rowCount > 0) return res.sendStatus(409);


        await db.query(`UPDATE customers SET name = $1, phone = $2, cpf = $3, birthday = $4 WHERE id = $5;`, [name, phone, cpf, formattedDateEdit, id]);

        res.sendStatus(200);

    } catch (err) {
        res.status(500).send(err.message);
    }

};