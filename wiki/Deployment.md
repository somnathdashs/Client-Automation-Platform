# Deployment Guide

## ☁️ Cloud Deployment (Heroku/Render)

This project is set up with a `Procfile` for easiest deployment.

**Prerequisites:**
- Since the app uses a local filesystem database (`data/`), generic cloud hostings invoke "Ephemeral Filesystems" which wipe data on restart.
- **Recommended**: Use a VPS (DigitalOcean, Linode) with Docker for persistent storage.
- **For Testing**: You can deploy to Render/Heroku, but data will reset when the dyno sleeps.

**Steps:**
1. Fork the repository.
2. Connect to your PaaS provider.
3. Deploy! The `Procfile` (`web: npm start`) handles the rest.
