// One-off script: wipes the 4 analytics tables and reloads them from CSV.
// Run from the Backend folder with: node reseed.js
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { Pool } = require("pg");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function loadCsv(filename) {
  const filePath = path.join(__dirname, filename);
  const content = fs.readFileSync(filePath, "utf8");
  return parse(content, { columns: true, skip_empty_lines: true });
}

async function main() {
  const client = await pool.connect();
  try {
    console.log("Reading CSVs...");
    const products = loadCsv("products.csv");
    const customers = loadCsv("customers.csv");
    const orders = loadCsv("orders.csv");
    const orderItems = loadCsv("order_items.csv");

    console.log(
      `Loaded: products=${products.length} customers=${customers.length} orders=${orders.length} order_items=${orderItems.length}`
    );

    await client.query("BEGIN");

    console.log("Truncating old data...");
    await client.query(
      "TRUNCATE order_items, orders, customers, products RESTART IDENTITY CASCADE"
    );

    console.log("Inserting products...");
    for (const p of products) {
      await client.query(
        "INSERT INTO products (product_id, name, category, price) VALUES ($1, $2, $3, $4)",
        [p.product_id, p.name, p.category, p.price]
      );
    }

    console.log("Inserting customers...");
    for (const c of customers) {
      await client.query(
        "INSERT INTO customers (customer_id, name, email, signup_date) VALUES ($1, $2, $3, $4)",
        [c.customer_id, c.name, c.email, c.signup_date]
      );
    }

    console.log("Inserting orders...");
    for (const o of orders) {
      await client.query(
        "INSERT INTO orders (order_id, customer_id, order_date, status) VALUES ($1, $2, $3, $4)",
        [o.order_id, o.customer_id, o.order_date, o.status]
      );
    }

    console.log("Inserting order_items...");
    for (const oi of orderItems) {
      await client.query(
        "INSERT INTO order_items (order_item_id, order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4, $5)",
        [oi.order_item_id, oi.order_id, oi.product_id, oi.quantity, oi.unit_price]
      );
    }

    console.log("Resyncing ID sequences...");
    await client.query(
      "SELECT setval(pg_get_serial_sequence('products','product_id'), (SELECT MAX(product_id) FROM products))"
    );
    await client.query(
      "SELECT setval(pg_get_serial_sequence('customers','customer_id'), (SELECT MAX(customer_id) FROM customers))"
    );
    await client.query(
      "SELECT setval(pg_get_serial_sequence('orders','order_id'), (SELECT MAX(order_id) FROM orders))"
    );
    await client.query(
      "SELECT setval(pg_get_serial_sequence('order_items','order_item_id'), (SELECT MAX(order_item_id) FROM order_items))"
    );

    await client.query("COMMIT");
    console.log("Done. Data reloaded successfully.");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Failed, rolled back. Error:", err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();