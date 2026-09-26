import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture || { url: "", publicId: "" },
});

const generateTokens = (userId) => {
    const accessToken = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" })

    const refreshToken = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" })

    return { accessToken, refreshToken };
};

const storeRefreshToken = async (userId, refreshToken) => {
    await redis.set(`refresh_token:${userId}`,refreshToken, "EX", 7 * 24 * 60 * 60);
};

const setCookie = (res, accessToken, refreshToken) => {
    res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        // Stripe redirects the browser back from stripe.com after checkout.
        // Lax keeps the cookie protected from cross-site requests while
        // allowing that top-level return navigation to retain the session.
        sameSite: "lax",
        maxAge: 15 * 60 * 1000 // 15 minutes
    })
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 1000 // 7 days
    })
};

export const signup = async (req, res) => {
    try {
        const { email, password, name } = req.body ?? {};

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ name, email, password });

        // authenticate
       const { accessToken, refreshToken } = generateTokens(user._id);
       await storeRefreshToken(user._id, refreshToken);

       setCookie(res, accessToken, refreshToken);

        res.status(201).json({
            user: publicUser(user)
        });
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: error.message });
    }
};
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            const { accessToken, refreshToken } = generateTokens(user._id);

            await storeRefreshToken(user._id, refreshToken);
            setCookie(res, accessToken, refreshToken);

            res.json({
                ...publicUser(user),
                message: "Logged in successfully"
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            try {
                const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
                await redis.del(`refresh_token:${decoded.userId}`);
            } catch (error) {
                // Clearing the browser cookies is still safe if the stored token expired or is invalid.
            }
        }

        res.clearCookie("accessToken");
        res.clearCookie("refreshToken");
        res.json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in logout controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            return res.status(401).json({ message: "No refresh token provided" });
        }

        const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
        const storedRefreshToken = await redis.get(`refresh_token:${decoded.userId}`);

        if (storedRefreshToken !== refreshToken) {
            return res.status(403).json({ message: "Invalid refresh token" });
        }

        const accessToken = jwt.sign({ userId: decoded.userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

        res.cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", maxAge: 15 * 60 * 1000 });

        res.json({ accessToken });
    } catch (error) {
        console.log("Error in refreshToken controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json(req.user);
    } catch (error) {
        console.log("Error in getProfile controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateProfilePicture = async (req, res) => {
    try {
        const image = req.body?.image;
        if (typeof image !== "string" || !/^data:image\/(jpeg|png|webp);base64,/i.test(image)) {
            return res.status(400).json({ message: "Please upload a JPEG, PNG, or WebP image" });
        }

        const base64 = image.split(",")[1] || "";
        const estimatedBytes = Math.ceil(base64.length * 0.75);
        if (estimatedBytes > 5 * 1024 * 1024) {
            return res.status(400).json({ message: "Profile picture must be 5 MB or smaller" });
        }

        const upload = await cloudinary.uploader.upload(image, {
            folder: "profile-pictures",
            transformation: [{ width: 600, height: 600, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" }],
        });

        const previousPublicId = req.user.profilePicture?.publicId;
        req.user.profilePicture = { url: upload.secure_url, publicId: upload.public_id };
        await req.user.save();

        if (previousPublicId) {
            cloudinary.uploader.destroy(previousPublicId).catch((error) => {
                console.log("Error deleting previous profile picture", error.message);
            });
        }

        return res.json({ user: publicUser(req.user) });
    } catch (error) {
        console.log("Error updating profile picture", error.message);
        return res.status(500).json({ message: "Unable to update profile picture" });
    }
};

export const removeProfilePicture = async (req, res) => {
    try {
        const publicId = req.user.profilePicture?.publicId;
        req.user.profilePicture = { url: "", publicId: "" };
        await req.user.save();

        if (publicId) {
            cloudinary.uploader.destroy(publicId).catch((error) => {
                console.log("Error deleting profile picture", error.message);
            });
        }

        return res.json({ user: publicUser(req.user) });
    } catch (error) {
        console.log("Error removing profile picture", error.message);
        return res.status(500).json({ message: "Unable to remove profile picture" });
    }
};
