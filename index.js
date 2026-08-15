
const express = require("express");
const uploadImage = require("./middleware/uploadImage");

const nodeCrypto = require("node:crypto");

if (!globalThis.crypto) {
  globalThis.crypto = nodeCrypto.webcrypto;
}
const path = require("path");
require("dotenv").config();
const ngrok = require("@ngrok/ngrok");
const mongoose = require("mongoose");

const {
  connectDB,
  News,
  Image,
  Staff,
  Schedule
} = require("./db");

const app = express();
const PORT = process.env.PORT || 5000;



// connect database
connectDB();

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// serve public folder
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// =======================
// SECURITY MIDDLEWARE
// =======================
const protectAdminRoute = (req, res, next) => {
  const token = req.headers.authorization;
  // In a real app, use process.env.ADMIN_TOKEN instead of hardcoding this
  if (token === "Bearer agaciro-secret-2026") {
    next(); // Token matches, let them in
  } else {
    res.status(401).json({ success: false, message: "Unauthorized: Invalid or missing token" });
  }
};

// setup hbs views
app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));

// pages
app.get("/", (req, res) => {
    res.render("index");
});

app.get("/dashboard", (req, res) => {
    res.render("dashboard");
});

app.get("/gallery", (req, res) => {
    res.render("gallery");
});

app.get("/schedule", (req, res) => {
    res.render("schedule");
});

app.get("/news", (req, res) => {
    res.render("news");
});

app.get("/staff", (req, res) => {
    res.render("staff");
});

///////////////////////////////////////////////////////////////////////////
// =======================
// NEWS API ROUTES
// =======================

// ADD NEWS
app.post("/api/news", protectAdminRoute, async (req, res) => {
  try {
    const { title, category, description, image, date } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, category and description are required"
      });
    }

    const news = await News.create({
      title,
      category,
      description,
      image: image || "",
      date: date || ""
    });

    res.status(201).json({
      success: true,
      message: "News added successfully",
      data: news
    });

  } catch (error) {
    console.error("Add news error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add news",
      error: error.message
    });
  }
});


// GET ALL NEWS
app.get("/api/news", async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: news
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: error.message
    });
  }
});


// GET ONE NEWS
app.get("/api/news/:id", async (req, res) => {
  try {
    const news = await News.findById(req.params.id);

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }

    res.json({
      success: true,
      data: news
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch news",
      error: error.message
    });
  }
});


// UPDATE NEWS
app.put("/api/news/:id", async (req, res) => {
  try {
    const { title, category, description, image, date } = req.body;

    if (!title || !category || !description) {
      return res.status(400).json({
        success: false,
        message: "Title, category and description are required"
      });
    }

    const updatedNews = await News.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        description,
        image: image || "",
        date: date || ""
      },
      { new: true, runValidators: true }
    );

    if (!updatedNews) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }

    res.json({
      success: true,
      message: "News updated successfully",
      data: updatedNews
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update news",
      error: error.message
    });
  }
});


// DELETE NEWS
app.delete("/api/news/:id", async (req, res) => {
  try {
    const deletedNews = await News.findByIdAndDelete(req.params.id);

    if (!deletedNews) {
      return res.status(404).json({
        success: false,
        message: "News not found"
      });
    }

    res.json({
      success: true,
      message: "News deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete news",
      error: error.message
    });
  }
});

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// =======================
// STAFF API ROUTES
// =======================

// ADD STAFF
app.post("/api/staff", async (req, res) => {
  try {
    const {
      name,
      role,

      // from your Mongo schema
      title,
      bio,
      image,
      email,
      phone,

      // from your frontend
      avatar,
      experience
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Name and role are required"
      });
    }

    const staff = await Staff.create({
      name,
      role,
      title: title || experience || "",
      bio: bio || "",
      image: image || avatar || "",
      email: email || "",
      phone: phone || ""
    });

    res.status(201).json({
      success: true,
      message: "Staff added successfully",
      data: staff
    });

  } catch (error) {
    console.error("Add staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add staff",
      error: error.message
    });
  }
});


// GET ALL STAFF
app.get("/api/staff", async (req, res) => {
  try {
    const staff = await Staff.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: staff
    });

  } catch (error) {
    console.error("Fetch staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error.message
    });
  }
});


// GET ONE STAFF
app.get("/api/staff/:id", async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    res.json({
      success: true,
      data: staff
    });

  } catch (error) {
    console.error("Fetch one staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch staff",
      error: error.message
    });
  }
});


// UPDATE STAFF
app.put("/api/staff/:id", async (req, res) => {
  try {
    const {
      name,
      role,
      title,
      bio,
      image,
      email,
      phone,
      avatar,
      experience
    } = req.body;

    if (!name || !role) {
      return res.status(400).json({
        success: false,
        message: "Name and role are required"
      });
    }

    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id,
      {
        name,
        role,
        title: title || experience || "",
        bio: bio || "",
        image: image || avatar || "",
        email: email || "",
        phone: phone || ""
      },
      { new: true, runValidators: true }
    );

    if (!updatedStaff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    res.json({
      success: true,
      message: "Staff updated successfully",
      data: updatedStaff
    });

  } catch (error) {
    console.error("Update staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update staff",
      error: error.message
    });
  }
});


// DELETE STAFF
app.delete("/api/staff/:id", async (req, res) => {
  try {
    const deletedStaff = await Staff.findByIdAndDelete(req.params.id);

    if (!deletedStaff) {
      return res.status(404).json({
        success: false,
        message: "Staff not found"
      });
    }

    res.json({
      success: true,
      message: "Staff deleted successfully"
    });

  } catch (error) {
    console.error("Delete staff error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete staff",
      error: error.message
    });
  }
});

///////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////
// =======================
// SCHEDULE API ROUTES
// =======================

// ADD SCHEDULE
app.post("/api/schedule", async (req, res) => {
  try {
    let { date, time, activity, type, location, status } = req.body;

    if (!date || !time || !activity || !type || !location) {
      return res.status(400).json({
        success: false,
        message: "Date, time, activity, type and location are required"
      });
    }

    type = type.toLowerCase();

    const allowedTypes = ["training", "match", "friendly"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be training, match or friendly"
      });
    }

    const schedule = await Schedule.create({
      date,
      time,
      activity,
      type,
      location,
      status: status || "Scheduled"
    });

    res.status(201).json({
      success: true,
      message: "Schedule added successfully",
      data: schedule
    });

  } catch (error) {
    console.error("Add schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add schedule",
      error: error.message
    });
  }
});


// GET ALL SCHEDULES
app.get("/api/schedule", async (req, res) => {
  try {
    const schedule = await Schedule.find().sort({ date: 1, createdAt: -1 });

    res.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error("Fetch schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error: error.message
    });
  }
});


// GET ONE SCHEDULE
app.get("/api/schedule/:id", async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    res.json({
      success: true,
      data: schedule
    });

  } catch (error) {
    console.error("Fetch one schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch schedule",
      error: error.message
    });
  }
});


// UPDATE SCHEDULE
app.put("/api/schedule/:id", async (req, res) => {
  try {
    let { date, time, activity, type, location, status } = req.body;

    if (!date || !time || !activity || !type || !location) {
      return res.status(400).json({
        success: false,
        message: "Date, time, activity, type and location are required"
      });
    }

    type = type.toLowerCase();

    const allowedTypes = ["training", "match", "friendly"];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Type must be training, match or friendly"
      });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      {
        date,
        time,
        activity,
        type,
        location,
        status: status || "Scheduled"
      },
      { new: true, runValidators: true }
    );

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    res.json({
      success: true,
      message: "Schedule updated successfully",
      data: updatedSchedule
    });

  } catch (error) {
    console.error("Update schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update schedule",
      error: error.message
    });
  }
});


// DELETE SCHEDULE
app.delete("/api/schedule/:id", async (req, res) => {
  try {
    const deletedSchedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!deletedSchedule) {
      return res.status(404).json({
        success: false,
        message: "Schedule not found"
      });
    }

    res.json({
      success: true,
      message: "Schedule deleted successfully"
    });

  } catch (error) {
    console.error("Delete schedule error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete schedule",
      error: error.message
    });
  }
});

///////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////
// =======================
// IMAGE / GALLERY API ROUTES
// =======================

// GET ALL IMAGES
app.get("/api/images", async (req, res) => {
  try {
    const images = await Image.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: images
    });

  } catch (error) {
    console.error("Fetch images error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch images",
      error: error.message
    });
  }
});

// GET SINGLE IMAGE
app.get("/api/images/:id", async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    res.json({
      success: true,
      data: image
    });

  } catch (error) {
    console.error("Fetch image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch image",
      error: error.message
    });
  }
});

// ADD IMAGE
app.post("/api/images", uploadImage.single("image"), async (req, res) => {
  try {

    const { title, category, description } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please select an image."
      });
    }

    const image = await Image.create({
      title,
      category,
      description,
      image: "/uploads/images/" + req.file.filename
    });

    res.status(201).json({
      success: true,
      message: "Image uploaded successfully.",
      data: image
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// UPDATE IMAGE
app.put("/api/images/:id", async (req, res) => {
  try {
    const { title, category, description, image } = req.body;

    const updatedImage = await Image.findByIdAndUpdate(
      req.params.id,
      {
        title,
        category,
        description: description || "",
        image
      },
      { new: true, runValidators: true }
    );

    if (!updatedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    res.json({
      success: true,
      message: "Image updated successfully",
      data: updatedImage
    });

  } catch (error) {
    console.error("Update image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update image",
      error: error.message
    });
  }
});

// DELETE IMAGE
app.delete("/api/images/:id", async (req, res) => {
  try {
    const deletedImage = await Image.findByIdAndDelete(req.params.id);

    if (!deletedImage) {
      return res.status(404).json({
        success: false,
        message: "Image not found"
      });
    }

    res.json({
      success: true,
      message: "Image deleted successfully",
      data: deletedImage
    });

  } catch (error) {
    console.error("Delete image error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete image",
      error: error.message
    });
  }
});

///////////////////////////////////////////////////////////////////////////








// start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});