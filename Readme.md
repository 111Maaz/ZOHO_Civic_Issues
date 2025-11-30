CivIQ – Civic Issue Reporter Bot
Smart Reporting for Smart Cities

CivIQ is an AI-powered civic issue reporting system built using Zoho SalesIQ Zobot, Supabase, and a custom backend hosted on Vercel.
It enables residents to report infrastructure problems through an intuitive chat interface—automating data collection, categorization, submission, and tracking.

Features
1. Automated Issue Reporting

Users can report:

Potholes

Water leakage

Electricity issues

Garbage overflow

Streetlight faults

Sewerage issues, and more

2. Intelligent Data Collection

The bot collects:

Issue type

Location (text)

Description

Optional image upload

Reporter contact details

3. Backend Workflow Integration

The bot sends collected data using a Webhook to a backend API which:

Stores the issue in Supabase

Generates a unique Tracking ID

Returns the ID to the user instantly

4. Real-Time Tracking

A unique tracking ID allows easy follow-up and database audit.

5. Fully Deployable Live Website

Includes a modern UI explaining:

What CivIQ is

How it works

Features

Integrated Zobot widget

Live Demo: https://zoho-civic-issues.vercel.app

Tech Stack
Component	Technology
Chatbot	Zoho SalesIQ Zobot
Backend	Node.js (Serverless Functions on Vercel)
Database	Supabase (PostgreSQL)
Storage	Supabase Storage (for images)
Hosting	Vercel
Frontend	HTML, CSS, JS (Single Page Website)
Architecture Overview
User → Zobot Chat Interface  
    → Webhook  
        → Vercel Serverless API  
            → Supabase Database  
                → Return Tracking ID  
                    → Zobot displays confirmation  

Project Structure
/api
   submitIssue.js        # Handles storing issues in Supabase
   updateStatus.js       # (Optional) For admin updates

index.html               # Landing page with integrated Zobot widget
vercel.json              # Vercel routing config
package.json             # Dependencies
assets/                  # Images, icons, logo

API Endpoints
POST /api/submitIssue

Handles:

Validation

Storing issue in Supabase

Generating Tracking ID

Returning JSON response

Purpose
CivIQ is designed as a scalable Smart City solution that reduces manual workload by automating civic issue reporting.
It demonstrates a complete end-to-end Zobot + Backend + Database integration suitable for government and public utility services.

Team
Team Name: 111MAXZ
Developer: Mohammed Maaz Ali

How to Run Locally
npm install
npm run dev

(Or use Vercel dev)

Contact
If you need support or demo details, reach out at maazali53093@gmail.com

🎉 Thank you for exploring CivIQ!