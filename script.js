import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config({ path: "./.env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error("Missing MONGODB_URI in .env.local");

const client = new MongoClient(uri);

async function storeAdmin(email, password) {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("signage");
    const usersCollection = db.collection("users"); // must match login API

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert admin user with correct fields
    const result = await usersCollection.insertOne({
      email,
      passwordHash,      // ✅ must match API
      role: "admin",     // ✅ must match API filter
      createdAt: new Date(),
    });

    console.log("Admin inserted with ID:", result.insertedId);
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await client.close();
    console.log("Connection closed");
  }
}

// Example usage
storeAdmin("admin@example.com", "admin123");
