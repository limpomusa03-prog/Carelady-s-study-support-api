const router = require("express").Router();
const pool = require("../db");

// Validate record details
function validateRecord(body) {
    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return "Request body must be a JSON object.";
    }

    const { title, category, description, status } = body;

    if (typeof title !== "string" ||
        title.trim().length < 3 ||
        title.trim().length > 80) {
        return "Title must have 3 to 80 characters.";
    }

    if (typeof category !== "string" ||
        category.trim().length < 2 ||
        category.trim().length > 40) {
        return "Category must have 2 to 40 characters.";
    }

    if (typeof description !== "string" ||
        description.trim().length < 5 ||
        description.trim().length > 300) {
        return "Description must have 5 to 300 characters.";
    }

    if (!["Pending", "In progress", "Completed"].includes(status)) {
        return "Invalid status.";
    }

    return null;
}

// GET all records
router.get("/", async (req, res, next) => {
    try {
        const result = await pool.query(
            "SELECT * FROM records ORDER BY id"
        );
        res.status(200).json(result.rows);
    } catch (error) {
        next(error);
    }
});

// GET one record
router.get("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const result = await pool.query(
            "SELECT * FROM records WHERE id = $1",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// POST create record
router.post("/", async (req, res, next) => {
    try {
        const errorMessage = validateRecord(req.body);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `INSERT INTO records
            (title, category, description, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                title.trim(),
                category.trim(),
                description.trim(),
                status
            ]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// PUT update record
router.put("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const errorMessage = validateRecord(req.body);

        if (errorMessage) {
            return res.status(400).json({
                message: errorMessage
            });
        }

        const { title, category, description, status } = req.body;

        const result = await pool.query(
            `UPDATE records
            SET title = $1, category = $2,
            description = $3, status = $4
            WHERE id = $5
            RETURNING *`,
            [
                title.trim(),
                category.trim(),
                description.trim(),
                status,
                id
            ]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
});

// DELETE record
router.delete("/:id", async (req, res, next) => {
    try {
        const id = Number(req.params.id);

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                message: "ID must be a positive whole number."
            });
        }

        const result = await pool.query(
            "DELETE FROM records WHERE id = $1 RETURNING id",
            [id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                message: "Record not found."
            });
        }

        res.status(200).json({
            message: "Record deleted."
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;