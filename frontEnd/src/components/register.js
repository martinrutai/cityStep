// src/components/login.js
import React, { useState } from 'react';
import { useUser } from './ContextUser';
import { useNavigate } from 'react-router-dom';

// 1. Import Google Sign-In components and utility
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function Register() {
    const navigate = useNavigate();
    // Assuming useUser provides login, register, AND a dedicated function for OAuth login
    const { login, register, loginWithGoogle, user } = useUser(); // Renamed to clarify functionality

    // State for local authentication forms
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');

    const registerHandler = (e) => {
        e.preventDefault();
        register({ name, password });
    };

    // --- Google OAuth Handlers ---
    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            const decodedUser = jwtDecode(credentialResponse.credential);
            console.log('Google User Decoded:', decodedUser);

            // 1. Prepare user data for your context
            const userData = { 
                googleId: decodedUser.sub, 
                name: decodedUser.name,
                email: decodedUser.email,
                picture: decodedUser.picture,
            };

            // 2. Call your context function to set the user state
            //    It's crucial that your context or backend handles this data.            
            const success = await loginWithGoogle(userData); 
            
            // 3. Redirect after successful sign-in
            if (success) {
                navigate('/');
            }
            
        } catch (error) {
            console.error('Google Sign-In Error:', error);
        }
    };

    const handleGoogleError = () => {
        console.error('Google Sign-In Failed');
    };

    return (
        <div style={{
            height: '100vh',
            overflow: 'hidden',
            fontFamily: 'system-ui, sans-serif',
            fontWeight: '700',
            fontSize: '1.2rem',
            backgroundColor: '#2b2b2b',
            color: 'white',
            padding: '5vw',
        }}>
            
            {/* Back Button */}
            <button 
                onClick={() => navigate(-1)} 
                style={{
                    color: 'white',
                    cursor: 'pointer',
                    backgroundColor: '#4f46e5',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '1vh 2vw',
                }}
            >
                ← Back
            </button>

            <h1 style={{ marginTop: '5vh' }}>Register</h1>

            {/* --- GOOGLE SIGN-IN --- */}
            <div style={{ marginTop: '5vh', display: 'flex', justifyContent: 'center' }}>
                <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                />
            </div>
            
            <p style={{ textAlign: 'center', margin: '3vh 0', fontSize: '1rem', color: '#ccc' }}>
                — OR register in with your account —
            </p>

            {/* REGISTER FORM */}
            <form onSubmit={registerHandler} style={{ marginTop: '3vh', display: 'flex', flexDirection: 'column', alignItems: 'center'  }}>
                {/* Note: In a real app, you would separate Login and Register fields 
                    or use a single form with a toggle, as they currently share the 'name' and 'password' state. */}
                <input
                    placeholder="Username"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={inputStyle}
                />
                <input
                    placeholder="Password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                />
                <button type="submit" style={btnStyle}>Register</button>
            </form>

                        <p style={{ textAlign: 'center', margin: '3vh 0', fontSize: '1rem', color: '#ccc' }}>
                — If you already have an account —
            </p>

                <button
            onClick={() => navigate('/login')}
            style={{
                width: '45vw',
                height: '3vh',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                marginTop: '1vh',
                cursor: 'pointer',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                fontSize: '1rem',
            }}
            >
            Login
            </button>
        </div>
    );
}

// nicer reusable input + button styles (kept from your original code)
const inputStyle = {
    width: '60vw',
    height: '4vh',
    margin: '1vh 0',
    padding: '8px',
    backgroundColor: '#212121',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    fontSize: '1rem'
};

const btnStyle = {
                width: '64vw',
                height: '4vh',
                backgroundColor: '#4f46e5',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                marginTop: '1vh',
                cursor: 'pointer',
                display: 'block',
                marginLeft: 'auto',
                marginRight: 'auto',
                fontSize: '1rem',
};

export default Register;