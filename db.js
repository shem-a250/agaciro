const mongoose = require("mongoose");

// ================= DATABASE CONNECTION =================
const connectDB = async () => {
  try {
    // Uses environment variable if available, otherwise defaults to local DB named 'agaciro'
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/agaciro");
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.log("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

// ================= NEWS SCHEMA =================
const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    category: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      required: true
    },

    image: {
      type: String,
      default: ""
    },

    date: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);


// ================= STAFF SCHEMA =================
const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    role: {
      type: String,
      required: true,
      trim: true
    },

    title: {
      type: String,
      default: ""
    },

    bio: {
      type: String,
      default: ""
    },

    image: {
      type: String,
      default: ""
    },

    email: {
      type: String,
      default: ""
    },

    phone: {
      type: String,
      default: ""
    }
  },
  { timestamps: true }
);

// ================= SCHEDULE SCHEMA =================
const scheduleSchema = new mongoose.Schema(
  {
    date: {
      type: String,
      required: true
    },

    time: {
      type: String,
      required: true
    },

    activity: {
      type: String,
      required: true
    },

    type: {
      type: String,
      enum: ["training", "match", "friendly"],
      required: true
    },

    location: {
      type: String,
      required: true
    },

    status: {
      type: String,
      default: "Scheduled"
    }
  },
  { timestamps: true }
);
const imageSchema = new mongoose.Schema({
    title: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    order: {
        type: Number,
        default: 0
    },
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});


// ================= MODELS =================
const News = mongoose.model("News", newsSchema);
const Image = mongoose.model("Image", imageSchema);
const Staff = mongoose.model("Staff", staffSchema);
const Schedule = mongoose.model("Schedule", scheduleSchema);

// ================= EXPORTS =================
module.exports = {
  connectDB,
  News,
  Image,
  Staff,
  Schedule
};