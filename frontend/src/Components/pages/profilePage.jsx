import React, { useEffect, useState } from "react";
import axios from "axios";
import {
    Box,
    Button,
    CircularProgress,
    Stack,
    TextField,
    Typography,
    Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        business_name: "",
        email: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!token) {
            navigate("/login");
            return;
        }

        const fetchProfile = async () => {
            try {
                const response = await axios.get("http://localhost:5000/api/auth/profile", {
                    headers: { Authorization: token },
                });

                if (response.data?.success) {
                    setFormData({
                        name: response.data.user.name || "",
                        business_name: response.data.user.business_name || "",
                        email: response.data.user.email || "",
                    });
                } else {
                    setError(response.data?.message || "Unable to load profile.");
                }
            } catch (err) {
                setError(err.response?.data?.message || "Unable to load profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate, token]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError(null);
        setMessage(null);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name || !formData.business_name || !formData.email) {
            setError("Please complete all fields before updating.");
            setMessage(null);
            return;
        }

        setSaving(true);
        setError(null);
        setMessage(null);

        try {
            const response = await axios.put(
                "http://localhost:5000/api/auth/profile",
                {
                    name: formData.name,
                    business_name: formData.business_name,
                    email: formData.email,
                },
                {
                    headers: { Authorization: token },
                }
            );

            if (response.data?.success) {
                setMessage("Profile updated successfully.");
                localStorage.setItem("user", JSON.stringify(response.data.user));
            } else {
                setError(response.data?.message || "Unable to update profile.");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Unable to update profile.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box
                sx={{
                    minHeight: "calc(100vh - 75px)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3, maxWidth: 760, mx: "auto" }}>
            <Typography variant="h4" sx={{ mb: 2, fontWeight: 700 }}>
                My Profile
            </Typography>

            <Typography sx={{ mb: 3, color: "text.secondary" }}>
                Update your account details below. Changes are saved immediately when you submit.
            </Typography>

            {message && (
                <Alert severity="success" sx={{ mb: 2 }}>
                    {message}
                </Alert>
            )}
            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Stack spacing={2}>
                    <TextField
                        label="Owner Name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Business Name"
                        name="business_name"
                        value={formData.business_name}
                        onChange={handleChange}
                        fullWidth
                        required
                    />
                    <TextField
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                        required
                    />

                    <Button
                        type="submit"
                        variant="contained"
                        size="large"
                        disabled={saving}
                        sx={{ width: "fit-content", mt: 1 }}
                    >
                        {saving ? "Saving..." : "Update Profile"}
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
};

export default ProfilePage;
