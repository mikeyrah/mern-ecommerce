import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { redis } from "../lib/redis.js";
import cloudinary from "../lib/cloudinary.js";
import crypto from "crypto";
import { sendEmailVerification, sendPasswordReset } from "../lib/email.js";

const publicUser = (user) => ({
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    profilePicture: user.profilePicture || { url: "", publicId: "" },
    emailVerified: Boolean(user.emailVerified),
});

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const newToken = () => crypto.randomBytes(32).toString("hex");

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
        const name = String(req.body?.name || "").trim();
        const email = String(req.body?.email || "").trim().toLowerCase();
        const password = String(req.body?.password || "");

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
        if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
        if (name.length > 100) return res.status(400).json({ message: "Name must be 100 characters or fewer" });

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }
        const user = await User.create({ name, email, password });

        const verificationToken = newToken();
        user.emailVerificationToken = hashToken(verificationToken);
        user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await user.save();

        // authenticate
       const { accessToken, refreshToken } = generateTokens(user._id);
       await storeRefreshToken(user._id, refreshToken);

       setCookie(res, accessToken, refreshToken);

       sendEmailVerification(user, verificationToken).catch((emailError) => {
           console.log("Unable to send verification email", emailError.message);
       });

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
        const email = String(req.body?.email || "").trim().toLowerCase();
        const password = String(req.body?.password || "");
        if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
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
        res.status(401).json({ message: "Your session has expired. Please sign in again." });
    }
};

export const getProfile = async (req, res) => {
    try {
        res.json(publicUser(req.user));
    } catch (error) {
        console.log("Error in getProfile controller", error.message);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const requestEmailVerification = async (req, res) => {
    try {
        if (req.user.emailVerified) return res.json({ message: "Your email is already verified" });

        const token = newToken();
        req.user.emailVerificationToken = hashToken(token);
        req.user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        await req.user.save();
        await sendEmailVerification(req.user, token);
        return res.json({ message: "Verification email sent" });
    } catch (error) {
        console.log("Error requesting email verification", error.message);
        return res.status(500).json({ message: "Unable to send verification email" });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const token = String(req.body?.token || "");
        if (!token) return res.status(400).json({ message: "Verification token is required" });
        const user = await User.findOne({
            emailVerificationToken: hashToken(token),
            emailVerificationExpires: { $gt: new Date() },
        }).select("+emailVerificationToken +emailVerificationExpires");
        if (!user) return res.status(400).json({ message: "This verification link is invalid or has expired" });

        user.emailVerified = true;
        user.emailVerificationToken = undefined;
        user.emailVerificationExpires = undefined;
        await user.save();
        return res.json({ message: "Email verified successfully" });
    } catch (error) {
        console.log("Error verifying email", error.message);
        return res.status(500).json({ message: "Unable to verify email" });
    }
};

export const forgotPassword = async (req, res) => {
    const genericMessage = "If an account uses that email, a password reset link is on its way";
    try {
        const email = String(req.body?.email || "").trim().toLowerCase();
        if (!/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ message: "Enter a valid email address" });
        const user = await User.findOne({ email });
        if (!user) return res.json({ message: genericMessage });

        const token = newToken();
        user.passwordResetToken = hashToken(token);
        user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
        await user.save();
        await sendPasswordReset(user, token);
        return res.json({ message: genericMessage });
    } catch (error) {
        console.log("Error requesting password reset", error.message);
        return res.status(500).json({ message: "Unable to send password reset email" });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const token = String(req.body?.token || "");
        const password = String(req.body?.password || "");
        if (!token) return res.status(400).json({ message: "Reset token is required" });
        if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
        const user = await User.findOne({
            passwordResetToken: hashToken(token),
            passwordResetExpires: { $gt: new Date() },
        }).select("+passwordResetToken +passwordResetExpires");
        if (!user) return res.status(400).json({ message: "This reset link is invalid or has expired" });

        user.password = password;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.emailVerified = true;
        await user.save();
        await redis.del(`refresh_token:${user._id}`);
        return res.json({ message: "Password updated. You can now sign in" });
    } catch (error) {
        console.log("Error resetting password", error.message);
        return res.status(500).json({ message: "Unable to reset password" });
    }
};

export const changePassword = async (req, res) => {
    try {
        const currentPassword = String(req.body?.currentPassword || "");
        const password = String(req.body?.password || "");
        if (password.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters" });
        const user = await User.findById(req.user._id);
        if (!user || !(await user.comparePassword(currentPassword))) return res.status(400).json({ message: "Current password is incorrect" });
        if (await user.comparePassword(password)) return res.status(400).json({ message: "Choose a password you have not just used" });

        user.password = password;
        await user.save();
        const { accessToken, refreshToken } = generateTokens(user._id);
        await storeRefreshToken(user._id, refreshToken);
        setCookie(res, accessToken, refreshToken);
        return res.json({ message: "Password changed successfully" });
    } catch (error) {
        console.log("Error changing password", error.message);
        return res.status(500).json({ message: "Unable to change password" });
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
