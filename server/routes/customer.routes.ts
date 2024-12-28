import { Router } from "express";
import axios from "axios";

const router = Router();
const BASE_URL = "http://localhost:3000/customers"; // Replace with your actual backend URL

function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Get all customers
router.get("/", async (req, res) => {
  try {
    const response = await axios.get(BASE_URL);
    res.json(response.data);
  } catch (error: unknown) {
    let message = "Error fetching customers";
    let status = 500;

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
      status = error.response?.status || status;
    } else if (isError(error)) {
      message = error.message;
    }

    console.error(message, error);
    res.status(status).json({ message });
  }
});

// Get customer by ID
router.get("/:id", async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/${req.params.id}`);
    res.json(response.data);
  } catch (error: unknown) {
    let message = "Error fetching customer";
    let status = 500;

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
      status = error.response?.status || status;
    } else if (isError(error)) {
      message = error.message;
    }

    console.error(message, error);
    res.status(status).json({ message });
  }
});

// Create new customer
router.post("/", async (req, res) => {
  try {
    const response = await axios.post(BASE_URL, req.body);
    res.status(201).json(response.data);
  } catch (error: unknown) {
    let message = "Error creating customer";
    let status = 500;

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
      status = error.response?.status || status;
    } else if (isError(error)) {
      message = error.message;
    }

    console.error(message, error);
    res.status(status).json({ message });
  }
});

// Update a customer
router.put("/:id", async (req, res) => {
  try {
    const response = await axios.put(`${BASE_URL}/update/${req.params.id}`, req.body);
    res.json(response.data);
  } catch (error: unknown) {
    let message = "Error updating customer";
    let status = 500;

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
      status = error.response?.status || status;
    } else if (isError(error)) {
      message = error.message;
    }

    console.error(message, error);
    res.status(status).json({ message });
  }
});

// Delete a customer
router.delete("/:id", async (req, res) => {
  try {
    const response = await axios.delete(`${BASE_URL}/delete/${req.params.id}`);
    res.json(response.data);
  } catch (error: unknown) {
    let message = "Error deleting customer";
    let status = 500;

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
      status = error.response?.status || status;
    } else if (isError(error)) {
      message = error.message;
    }

    console.error(message, error);
    res.status(status).json({ message });
  }
});

// Search for customers by query
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;
    const response = await axios.get(`${BASE_URL}/search`, { params: { query } });
    res.json(response.data);
  } catch (error: unknown) {
    let message = "Error searching for customers";
    let status = 500;

    if (axios.isAxiosError(error)) {
      message = error.response?.data?.message || message;
      status = error.response?.status || status;
    } else if (isError(error)) {
      message = error.message;
    }

    console.error(message, error);
    res.status(status).json({ message });
  }
});

export default router;
