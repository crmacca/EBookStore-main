const path = require('path');
const express = require('express');

function setupStatic(app) {
    console.log('Serving static')
    // Serve static files from the React build directory
    app.use(express.static(path.join(__dirname, '../client/build')));

    // Fallback to serve index.html for any routes not recognized
    // This is important for single-page applications (SPA) that use client-side routing.
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
    });
}

module.exports = setupStatic;
