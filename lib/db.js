const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  timezone: "+00:00",
});

async function query(sql, params) {
  try {
    // Attempt to get a connection from the pool
    const connection = await pool.getConnection();

    try {
      const [rows, fields] = await connection.execute(sql, params);
      return rows;
    } catch (queryError) {
      // Handle errors specific to the query execution
      console.error("Error executing query:", queryError);

      // If it's a deadlock or lock wait timeout, retry the query
      if (
        queryError.code === "ER_LOCK_DEADLOCK" ||
        queryError.code === "ER_LOCK_WAIT_TIMEOUT"
      ) {
        console.warn("Deadlock or lock wait timeout, retrying query...");
        return query(sql, params); // Retry once
      } else {
        // Other query errors: rethrow or return an error object
        return { error: queryError };
      }
    } finally {
      // Always release the connection back to the pool
      connection.release();
    }
  } catch (connectionError) {
    // Handle errors specifically related to getting a connection
    console.error("Error getting connection from pool:", connectionError);
    return { error: connectionError }; // or rethrow depending on your error handling strategy
  }
}

module.exports = { query };
